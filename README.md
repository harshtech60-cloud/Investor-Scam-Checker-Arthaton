# Investor-Scam-Checker-Arthaton - Project repository for our  team’s Arthaton Hackathon solution.
# 🛡️ Investor Scam Check =

**A second opinion in your family's language, before the money moves.**

A pre-payment risk check for Indian retail investors. Paste a message, upload a screenshot, or scan a UPI QR, and see which warning signs are present, in 12 languages, with a direct hand-off to the official SEBI, RBI and cyber-crime portals.

[**Live demo**](https://remix-investor-scam-check-4270.ai.studio) · Built for the **Arthaton Finance Hackathon** (theme: *Investor Scam Check*)

## The problem

Investment scams reach families as a forwarded WhatsApp message or a screenshot, with minutes to decide. The people most at risk read Hindi, Tamil or Bengali, not English, and most checkers expect them to type, translate, or already know the signs.

## What it does

| Check | What you give it | What you get back |
| --- | --- | --- |
| **Message** | Pasted text, or a **screenshot** | Which warning signs appear (guaranteed returns, urgency, fees, secret requests, VIP groups, impersonation) with the exact phrases highlighted |
| **Group chat** | A pasted WhatsApp / Telegram conversation | Which of five escalation stages the chat reaches, and which stages it cannot support |
| **Payment** | A UPI ID, bank detail, or a **QR image** | A pre-payment reminder, with the UPI ID and amount decoded from the QR on your device |
| **Link** | A website or app link | Lookalike-domain, shortener, `http://` and risky-extension warnings; real brokers' subdomains pass |
| **SEBI claim** | A claimed registration number | Format check, with a direct hand-off to SEBI to verify it |
| **"I already paid"** | A few taps | A step-by-step first-hour guide (call 1930, contact your bank, preserve evidence) |

The four clues (message, SEBI claim, link, payment detail) are shown together so you can see where they agree or conflict, and a printable **family summary** can be handed to a parent.

### Scam patterns it recognises

- Guaranteed or very high returns, "sure-shot" calls, lakh/crore income promises
- Urgency and pressure to pay now; registration, unlock and withdrawal-tax fees
- VIP groups, off-platform Telegram/WhatsApp invites, unofficial trading apps and `.apk` files
- **Digital arrest**, fake police / CBI / customs threats, and "transfer to a safe account" demands
- **Task and part-time-job fraud** (rate or like items, then deposit to unlock tasks)
- **Fake crypto and trading platforms**, and "my uncle has inside information" stories
- **Deepfake celebrity endorsements** of trading apps
- PIN-to-receive and QR-to-receive tricks; OTP, PIN and CVV requests; remote-access apps
- **Lookalike domains** such as `zer0dha-trade.com`, plus Hinglish (Hindi in English letters)

Advice and awareness text is not flagged: "police never ask you to transfer money to a safe account" stays clean.

---

## How it works

                         Message · screenshot · link· UPI / QR - only after you consent 
                                                   ||
            Gemini reviewkey stays on the server , Local rule engineruns in the browser,explainable
                                                   ||
                                       Risk indicatorsnever 'safe'
                                                   ||
                            -- Official hand-offsSEBI Check · RBI · NPCI ·1930 --
- **Rules first.** The checks run locally with no network call, so the core result is instant, free and explainable: every flag points at the exact words that caused it.
- **AI is optional and consent-gated.** Gemini adds a plain-language review only after you click **Continue**. The Gemini key lives on the server and is never sent to the browser.
- **It never says "safe".** The possible outcomes are "warning signs found" and "no listed warning signs found", always with a reminder to verify on the official portals.

### Privacy

- Before any text is sent to AI, the browser redacts OTPs, PINs, passwords, CVVs, card and bank numbers, 12-digit IDs, phone numbers, emails, PAN, IFSC codes and personal UPI usernames, and the server redacts again before calling Gemini.
- Optional clue fields (SEBI number, link, payment detail, amount) are **not** sent to Gemini with a message review.
- **Screenshots** are the one thing that cannot be redacted first, so reading one requires an explicit consent step that tells you to crop out personal details. The image is re-drawn in the browser (which removes location metadata), forwarded to Gemini and discarded.
- **QR codes are decoded on your device.** The image is never uploaded.
- The server is stateless: no database, and messages, conversations, images and AI responses are never stored or logged.
- AI review and screenshot endpoints are rate limited per IP. If AI is unavailable, the local result stays visible.

---

## Evaluation

The rule engine is tested on **50 synthetic examples** (24 single messages and 26 group chats, with no real names, numbers or accounts) that are stored separately from the demo presets in `src/data/presets.ts`.

| Scope | Total | Correct warnings (TP) | Missed (FN) | False warnings (FP) | Correct no-warning (TN) |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Overall** | **50** | **23** | **4** | **1** | **22** |
| Single message | 24 | 11 | 1 | 0 | 12 |
| Group chat | 26 | 12 | 3 | 1 | 10 |

**Known misses (shown on purpose):** Bengali, Telugu and Gujarati phrasing, and Hindi withdrawal-tax / APK wording, are not yet covered by the rules.
**Known false positive:** an anti-scam training chat that quotes phrases like "today only" and "unlock fee" is flagged.

The newer scam types (digital arrest, task fraud, crypto platforms, deepfake ads, Hinglish) are covered by unit tests rather than by this 50-example set, and their rules currently cover English and Hinglish only. The full dataset and rationales are in [`src/evaluation/evaluationSet.ts`](src/evaluation/evaluationSet.ts).

```bash
npx tsx src/evaluation/runEvaluation.ts
```

---

## What is real and what is demo-only

| Real | Demo-only today |
| --- | --- |
| Message, group-chat, link and payment-detail screening (rules, offline) | **Live SEBI registry lookup.** The SEBI check validates the number's format only and hands you to SEBI |
| Screenshot reading (Gemini vision, with consent) and on-device UPI QR decoding | **Payee verification.** A decoded UPI ID is shown to you, not verified |
| 12-language interface, printable family summary, "I already paid" guide | **Domain age / WHOIS and app-store checks** |
| Optional consent-gated Gemini review with redaction | Anything beyond the rule coverage above |

Always verify directly with the official sources:

- [SEBI Check (UPI IDs, QR codes, bank details)](https://siportal.sebi.gov.in/intermediary/sebi-check)
- [SEBI Spot Any Scam](https://investor.sebi.gov.in/spot-any-scam.html)
- [SEBI: Fake trading app scam guidance](https://investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf)
- [SEBI Investor Support (intermediaries and authorised apps)](https://investor.sebi.gov.in/Investor-support.html)
- [RBI safe digital banking practices](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185)
- [NPCI UPI fraud awareness](https://www.npci.org.in/fraud-awareness)
- [National Cyber Crime Reporting Portal](https://cybercrime.gov.in/) or call **1930**

---

## Languages (12)

English, Easy English, हिन्दी, मराठी, தமிழ், বাংলা, తెలుగు, ಕನ್ನಡ, മലയാളം, ગુજરાતી, ਪੰਜਾਬੀ and Español. Warning explanations for the newest scam types fall back to English in the other languages.

---

## Run it locally

Requires **Node.js 22 or newer** (the server and tests run TypeScript through `tsx`).

```bash
npm install
cp .env.example .env      # then put your key in GEMINI_API_KEY (optional: rules work without it)
npm run dev               # http://localhost:3000
```

| Variable | Needed for | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | AI review, group-chat review, screenshot reading | Server-side only. Without it, rule-based checks still work |
| `NODE_ENV=production` | Serving the built app | Set on any real host, otherwise the dev bundler runs |
| `PORT` | Hosting | Defaults to 3000 |

**Production:** `npm run build`, then `NODE_ENV=production npm start`. The app is published with Google AI Studio and runs on any Node host.

### Tests

```bash
npx tsx --test src/utils/analyzer.test.ts src/utils/aiReview.test.ts src/utils/groupChatAnalyzer.test.ts src/utils/postIncidentHelp.test.ts src/utils/screenshotAndQr.test.ts src/utils/editorialMotion.test.ts src/evaluation/evaluation.test.ts
```

Covers the analyzers, redaction, stage evidence, post-incident help, the screenshot and QR helpers, and the evaluation set's integrity.

---

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Express · `@google/genai` (Gemini) · `jsqr` (on-device QR decoding) · three.js and Motion (visuals) · Lucide icons

## Project structure

```text
server.ts                 Express server: stateless AI endpoints, rate limits, static hosting
src/
  components/             Message, payment and group-chat views, result tiles, family summary
  utils/
    analyzer.ts           Rule engine for messages, links, SEBI claims and payments
    domainChecks.ts       Official-domain allow-list and lookalike detection
    groupChatAnalyzer.ts  Five-stage group-chat analysis
    aiReview*.ts          Redaction, schema validation, Gemini calls
    screenshot*.ts        Screenshot reading helpers and server call
    upiQr.ts              UPI QR parser
  data/locales/           12 language packs
  evaluation/             Synthetic dataset and runner
```

## Roadmap

- Live SEBI registry check, replacing the format-only check
- Domain age and registration checks
- Rule coverage for the newest scam types in Hindi and the other regional languages
- A learned classifier trained on labelled real-world messages, reported next to the rules
- A WhatsApp share target / installable PWA, so a forwarded message opens straight into the check

## Disclaimer

This is an educational screening tool, not financial, legal or investment advice, and it cannot prove that anything is genuine. If you have lost money, call **1930** and report at [cybercrime.gov.in](https://cybercrime.gov.in/) as soon as possible.

