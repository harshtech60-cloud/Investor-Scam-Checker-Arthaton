import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GroupChatStageId, Language } from './src/types/check.ts';
import type { AiVerdictLabels, GroupChatAiLabels } from './src/utils/aiReviewHelpers.ts';
import { requestAiMessageReview } from './src/utils/aiReviewServer.ts';
import { requestGroupChatAiReview } from './src/utils/groupChatAiServer.ts';
import { requestScreenshotExtract } from './src/utils/screenshotServer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_LANGUAGES = new Set<Language>([
  'en',
  'en-easy',
  'hi',
  'mr',
  'ta',
  'bn',
  'te',
  'kn',
  'ml',
  'gu',
  'pa',
  'es',
]);

function parseLabels(raw: unknown): AiVerdictLabels | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.verdictWarningSigns === 'string' &&
    typeof r.verdictNoListedSigns === 'string' &&
    typeof r.noSignsFoundNote === 'string' &&
    typeof r.limitationsBody === 'string' &&
    typeof r.demoDisclaimer === 'string'
  ) {
    return {
      verdictWarningSigns: r.verdictWarningSigns,
      verdictNoListedSigns: r.verdictNoListedSigns,
      noSignsFoundNote: r.noSignsFoundNote,
      limitationsBody: r.limitationsBody,
      demoDisclaimer: r.demoDisclaimer,
    };
  }
  return undefined;
}

const STAGE_IDS: GroupChatStageId[] = [
  'initial_offer',
  'trust_building',
  'app_or_group_invite',
  'payment_or_recruiting_pressure',
  'withdrawal_friction',
];

function parseGroupChatLabels(raw: unknown): GroupChatAiLabels | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const stageTitlesRaw = r.stageTitles as Record<string, unknown> | undefined;
  if (
    typeof r.verdictWarningSigns === 'string' &&
    typeof r.verdictNoListedSigns === 'string' &&
    typeof r.noSafeProofNote === 'string' &&
    typeof r.singlePhraseNote === 'string' &&
    typeof r.stageSupportedBadge === 'string' &&
    typeof r.stageNotEnoughInfoBadge === 'string' &&
    typeof r.stageNotEnoughInfoDesc === 'string' &&
    typeof r.cannotVerifyDirectlyLabel === 'string' &&
    typeof r.disclaimerNote === 'string' &&
    stageTitlesRaw &&
    typeof stageTitlesRaw === 'object' &&
    STAGE_IDS.every((id) => typeof stageTitlesRaw[id] === 'string') &&
    Array.isArray(r.defaultUncheckedItems) &&
    Array.isArray(r.defaultNextSteps)
  ) {
    return {
      verdictWarningSigns: r.verdictWarningSigns,
      verdictNoListedSigns: r.verdictNoListedSigns,
      noSafeProofNote: r.noSafeProofNote,
      singlePhraseNote: r.singlePhraseNote,
      stageSupportedBadge: r.stageSupportedBadge,
      stageNotEnoughInfoBadge: r.stageNotEnoughInfoBadge,
      stageNotEnoughInfoDesc: r.stageNotEnoughInfoDesc,
      stageTitles: stageTitlesRaw as Record<GroupChatStageId, string>,
      cannotVerifyDirectlyLabel: r.cannotVerifyDirectlyLabel,
      defaultUncheckedItems: r.defaultUncheckedItems.map(String),
      defaultNextSteps: r.defaultNextSteps.map(String),
      disclaimerNote: r.disclaimerNote,
    };
  }
  return undefined;
}

function makeLimiter(max: number, windowMs = 60_000) {
  const hits = new Map<string, number[]>();
  return (ip: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > max;
  };
}
const aiLimited = makeLimiter(10); // 10 AI reviews per minute per IP

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const isProd = process.env.NODE_ENV === 'production';
  // In dev mode inside AI Studio, Nginx listens on 8080 and proxies to port 3000.
  // Bind to port 3000 in development even if PORT=8080 is set in the container environment.
  const port = isProd
    ? Number(process.env.PORT) || 3000
    : Number(process.env.PORT) === 8080
      ? 3000
      : Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');

  const shotLimited = makeLimiter(8); // 8 screenshots per minute per IP

  // Stateless: the image is forwarded to Gemini and never written to disk or logged.
  app.post('/api/extract-screenshot', express.json({ limit: '6mb' }), async (req, res) => {
    if (shotLimited(req.ip ?? 'unknown')) {
      res.status(429).json({ ok: false, reason: 'rate_limited', message: 'Too many screenshot checks. Please wait a minute.' });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const outcome = await requestScreenshotExtract({
      imageBase64: typeof body.imageBase64 === 'string' ? body.imageBase64 : '',
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : '',
    });
    res.status(outcome.ok ? 200 : outcome.reason === 'bad_image' ? 400 : 503).json(outcome);
  });

  app.use(express.json({ limit: '48kb' }));

  app.get('/api/ai-review/status', (_req, res) => {
    res.json({
      available: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  // Intentionally stateless: never saves messages or AI responses to any database or log
  app.post('/api/ai-review', async (req, res) => {
    if (aiLimited(req.ip ?? 'unknown')) {
      res.status(429).json({ ok: false, available: false, reason: 'quota_or_billing', message: 'Too many requests. Please wait a minute.' });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const messageText = typeof body.messageText === 'string' ? body.messageText : '';
    const langCandidate = typeof body.language === 'string' ? (body.language as Language) : 'en';
    const language: Language = VALID_LANGUAGES.has(langCandidate) ? langCandidate : 'en';
    const labels = parseLabels(body.labels);

    const outcome = await requestAiMessageReview({
      messageText,
      language,
      labels,
    });

    if (!outcome.ok) {
      const statusCode = outcome.reason === 'empty_message' ? 400 : 503;
      res.status(statusCode).json(outcome);
      return;
    }

    res.json(outcome);
  });

  // Intentionally stateless: never saves group conversations or AI responses to any database or log
  app.post('/api/group-chat-review', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const conversationText =
      typeof body.conversationText === 'string' ? body.conversationText : '';
    const langCandidate = typeof body.language === 'string' ? (body.language as Language) : 'en';
    const language: Language = VALID_LANGUAGES.has(langCandidate) ? langCandidate : 'en';
    const labels = parseGroupChatLabels(body.labels);

    const outcome = await requestGroupChatAiReview({
      conversationText,
      language,
      labels,
    });

    if (!outcome.ok) {
      const statusCode = outcome.reason === 'empty_message' ? 400 : 503;
      res.status(statusCode).json(outcome);
      return;
    }

    res.json(outcome);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Investor Scam Check server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
