import { pathToFileURL } from 'node:url';
import { analyzeMessagePillar } from '../utils/analyzer';
import { analyzeGroupChat } from '../utils/groupChatAnalyzer';
import {
  EVALUATION_DATASET,
  type EvalMode,
  type EvalVerdictLabel,
  type EvaluationExample,
} from './evaluationSet';

export interface ExampleEvalOutcome {
  id: string;
  mode: EvalMode;
  language: string;
  category: string;
  expectedLabel: EvalVerdictLabel;
  predictedLabel: EvalVerdictLabel;
  matched: boolean;
  classification: 'TP' | 'TN' | 'FP' | 'FN';
  reason: string;
  textPreview: string;
  triggeredPhrases: string[];
  supportedStageCount?: number;
}

export interface ConfusionCounts {
  total: number;
  correctWarningsTP: number;
  missedWarningsFN: number;
  falseWarningsFP: number;
  correctNoWarningsTN: number;
}

export interface EvaluationSummaryReport {
  overall: ConfusionCounts;
  byMode: Record<EvalMode, ConfusionCounts>;
  falsePositives: ExampleEvalOutcome[];
  falseNegatives: ExampleEvalOutcome[];
  outcomes: ExampleEvalOutcome[];
}

function emptyCounts(): ConfusionCounts {
  return {
    total: 0,
    correctWarningsTP: 0,
    missedWarningsFN: 0,
    falseWarningsFP: 0,
    correctNoWarningsTN: 0,
  };
}

function recordCount(counts: ConfusionCounts, classification: ExampleEvalOutcome['classification']) {
  counts.total += 1;
  if (classification === 'TP') counts.correctWarningsTP += 1;
  else if (classification === 'FN') counts.missedWarningsFN += 1;
  else if (classification === 'FP') counts.falseWarningsFP += 1;
  else counts.correctNoWarningsTN += 1;
}

export function evaluateExample(example: EvaluationExample): ExampleEvalOutcome {
  let predictedLabel: EvalVerdictLabel;
  let triggeredPhrases: string[] = [];
  let supportedStageCount: number | undefined;

  if (example.mode === 'single_message') {
    const pillar = analyzeMessagePillar(example.text);
    predictedLabel =
      pillar.status === 'high_risk' || pillar.status === 'caution'
        ? 'Warning signs found'
        : 'No listed warning signs found';
    triggeredPhrases = pillar.warnings?.map((w) => w.phrase) ?? [];
  } else {
    // Evaluate in English label space so expectedLabel ('Warning signs found' / 'No listed warning signs found') matches verbatim
    const gcRes = analyzeGroupChat(example.text, 'en');
    predictedLabel = gcRes.verdictLabel as EvalVerdictLabel;
    triggeredPhrases = gcRes.warningSigns.map((w) => w.supportingPhrase);
    supportedStageCount = gcRes.stages.filter((s) => s.status === 'supported').length;
  }

  let classification: ExampleEvalOutcome['classification'];
  if (example.expectedLabel === 'Warning signs found') {
    classification = predictedLabel === 'Warning signs found' ? 'TP' : 'FN';
  } else {
    classification = predictedLabel === 'No listed warning signs found' ? 'TN' : 'FP';
  }

  return {
    id: example.id,
    mode: example.mode,
    language: example.language,
    category: example.category,
    expectedLabel: example.expectedLabel,
    predictedLabel,
    matched: classification === 'TP' || classification === 'TN',
    classification,
    reason: example.reason,
    textPreview: example.text.replace(/\s+/g, ' ').slice(0, 140),
    triggeredPhrases,
    supportedStageCount,
  };
}

export function runEvaluationSuite(
  dataset: EvaluationExample[] = EVALUATION_DATASET
): EvaluationSummaryReport {
  const overall = emptyCounts();
  const byMode: Record<EvalMode, ConfusionCounts> = {
    single_message: emptyCounts(),
    group_chat: emptyCounts(),
  };

  const outcomes: ExampleEvalOutcome[] = [];
  const falsePositives: ExampleEvalOutcome[] = [];
  const falseNegatives: ExampleEvalOutcome[] = [];

  for (const ex of dataset) {
    const outcome = evaluateExample(ex);
    outcomes.push(outcome);
    recordCount(overall, outcome.classification);
    recordCount(byMode[ex.mode], outcome.classification);
    if (outcome.classification === 'FP') falsePositives.push(outcome);
    if (outcome.classification === 'FN') falseNegatives.push(outcome);
  }

  return {
    overall,
    byMode,
    falsePositives,
    falseNegatives,
    outcomes,
  };
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  const report = runEvaluationSuite();
  console.log(
    JSON.stringify(
      {
        overall: report.overall,
        byMode: report.byMode,
        falsePositives: report.falsePositives,
        falseNegatives: report.falseNegatives,
      },
      null,
      2
    )
  );
}
