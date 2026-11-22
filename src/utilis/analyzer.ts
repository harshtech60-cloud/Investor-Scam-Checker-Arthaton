import type {
  Language,
  LocalizedText,
  MessageCheckInput,
  PaymentCheckInput,
  PaymentCheckResult,
  PaymentFindingItem,
  PillarFinding,
  PillarWarningDetail,
  RiskLevel,
  TranslationBundle,
  UnifiedCheckResult,
} from '../types/check';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../data/translations';
import { redactGroupChatText, redactSensitiveText } from './aiReviewHelpers';
import { detectLookalike, hasSuspiciousTld, isOfficialHost } from './domainChecks';
type AnalyzerCopy = TranslationBundle['analyzer'];

function loc(getter: (a: AnalyzerCopy) => string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = getter(TRANSLATIONS[opt.code].analyzer);
    return acc;
  }, {} as Record<Language, string>);
}
type OptionalAnalyzerKey = {
  [K in keyof AnalyzerCopy]-?: undefined extends AnalyzerCopy[K] ? K : never;
}[keyof AnalyzerCopy];

/** Locale string for keys that only exist in en.ts so far; other languages fall back to English. */
function locOpt(key: OptionalAnalyzerKey): LocalizedText {
  return loc((a) => (a[key] as string | undefined) ?? (TRANSLATIONS.en.analyzer[key] as string));
}
const SEBI_REGEX = /\bIN[AHMPZ]\d{9}\b/i;
const UPI_REGEX = /\b[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}\b/;

const SHORTENER_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'is.gd',
  'wa.me',
  't.me',
];

const SECRET_NOUN_PATTERN =
  /\b(?:upi\s*pin|atm\s*pin|mpin|tpin|m-pin|t-pin|debit\s*pin|card\s*pin|bank\s*pin|secret\s*pin|4[- ]?digit\s*pin|6[- ]?digit\s*pin|pin|otp|one[- ]?time\s*pass(?:word|code)|password|passcode|cvv)\b/i;

// Sender reassurance & hype phrases must never mask a real request in the same sentence
const SENDER_REASSURANCE_STRIP =
  /\b(?:do\s+not|don't|never|no\s+need\s+to|nothing\s+to)\s+worry\b|\bno\s+worries\b|\b(?:this|it|that|everything|payment|transfer)\s+is\s+(?:100%\s+)?(?:completely\s+|totally\s+|fully\s+|very\s+)?safe(?:\s+and\s+secure)?\b|\bnot\s+a\s+(?:scam|fraud|spam|fake)\b|\bno\s+(?:scam|fraud|hidden\s+charges)\b|\b(?:never|do\s+not|don't)\s+(?:miss(?:\s+(?:out|this))?|delay|hesitate|lose(?:\s+out)?)\b|\b(?:no\s+te\s+preocupes|es\s+(?:100%\s+)?seguro|no\s+es\s+(?:una\s+)?estafa)\b|(?:चिंता\s+(?:मत|न)\s+करें|(?:यह|बिलकुल)\s+सुरक्षित\s+है)/gi;

const PROTECTIVE_SECRET_CLAUSE =
  /\b(?:never|do\s+not|don't|does\s+not|doesn't|will\s+not|won't|can(?:not|'t)|should\s+(?:not|never)|must\s+(?:not|never)|nobody\s+(?:will|should|can)|no\s+one\s+(?:will|should|can)|avoid|refuse\s+to|stop)\b.{0,65}\b(?:share|shared|sharing|send|sent|sending|give|given|giving|tell|telling|enter|entered|entering|type|typing|provide|providing|disclose|disclosing|reveal|revealing|forward|forwarding|need|use|scan|approve|ask(?:s|ed|ing)?(?:\s+(?:you\s+)?for)?|demand(?:s|ed|ing)?|require(?:s|d)?)\b|\b(?:otp|pin|password|passcode|cvv|mpin|tpin)\b.{0,35}\b(?:is|are|should|must|will)\s+(?:not|never)\b|\b(?:only\s+sends\s+money\s+out|keep\s+(?:your\s+)?(?:upi\s*pin|atm\s*pin|pin|otp|cvv|password|passcode)\s+(?:safe|private|secret|confidential)|protect\s+your\s+(?:upi\s*pin|atm\s*pin|pin|otp|cvv|password)|only\s+(?:in|inside|within|on)\s+(?:your\s+)?(?:own\s+)?(?:official\s+)?(?:bank|banking|upi)\s+app|beware\s+of|be\s+(?:careful|cautious|wary|alert)\s+(?:when(?:ever)?|if)\s+(?:anyone|someone)|warning\s*:|red\s+flag|scam(?:s|mers?)?\s+(?:often\s+)?(?:ask|try|demand)|fraud(?:sters?)?\s+(?:often\s+)?(?:ask|try|demand))\b|(?:कभी\s+(?:भी\s+)?(?:साझा|शेयर|बताएं|नहीं|मत)|साझा\s+न\s+करें|शेयर\s+न\s+करें|मत\s+(?:बताएं|भेजें|डालें|शेयर)|न\s+(?:बताएं|भेजें|साझा)|नहीं\s+मांगता|सावधान|चेतावनी|कधीही\s+(?:सांगू|पाठवू|शेअर\s+करू)\s+नका|शेअर\s+करू\s+नका|பகிர\s+வேண்டாம்|பகிராதீர்கள்|அனுப்பாதீர்கள்|\bnunca\s+(?:compartas|env[ií]es|des|ingreses)\b|\bno\s+(?:compartas|env[ií]es|entregues|ingreses|pidas)\b)/i;

const DESCRIPTIVE_SECRET_CLAUSE =
  /\b(?:bank|system|app|portal|merchant|server|gateway|upi)\s+(?:will\s+|may\s+)?send(?:s|ing)?\s+(?:you\s+|an\s+)?(?:otp|one[- ]?time\s*pass(?:word|code))\b|\b(?:you\s+(?:will\s+|may\s+)?receive|sent\s+to\s+(?:your|the)\s+(?:registered\s+)?(?:mobile|phone|number|email)|expires?\s+in\s+\d+)\b|\bel\s+banco\s+env[ií]a\s+(?:un\s+)?otp\b|(?:बैंक\s+(?:लॉगिन\s+के\s+लिए\s+)?(?:ओटीपी|OTP)\s+भेजता\s+है)/i;

const PIN_TO_RECEIVE_PATTERN =
  /(?:(?:enter|type|put|confirm|use|submit)\s+(?:your\s+)?(?:upi\s*pin|mpin|pin)|(?:scan|open)\s+(?:this|the|a)?\s*(?:qr(?:\s*code)?|payment\s*link)|approve\s+(?:the\s+)?(?:collect|upi)\s*request)\b.{0,40}\b(?:to|for)\s+(?:receive|receiving|claim|get|getting|unlock|collect|credit|refund|cashback|reward|prize|profit)\b|(?:upi\s*pin|qr(?:\s*code)?)\s+(?:is\s+)?(?:required|needed)\s+(?:to|for)\s+(?:receive|receiving|claim|refund|cashback|reward|profit)\b|(?:पैसे\s+(?:पाने|लेने)|रिफंड|कैशबैक)\s+के\s+लिए\s+(?:UPI\s*PIN|पिन|QR)/i;

const SECRET_ACTION_REQUEST_EN_ES =
  /(?:(?:please|kindly|just)\s+)?\b(?:share|send|give|tell|enter|type|provide|submit|forward|confirm|verify|reveal|disclose|pass|reply(?:\s+with)?|dm|message|put|fill(?:\s+in)?|paste|read(?:\s+out)?|need(?:s)?|require(?:s)?|ask(?:ing)?\s+for|comparte|env[ií]a|dame|ingresa|escribe)\b(?:\s+(?:me|us|your|the|my|tu|su|el|la|a|an|that|this|6[- ]?digit|4[- ]?digit|new|de)){0,4}\s+(?:upi\s*pin|atm\s*pin|mpin|tpin|m-pin|t-pin|debit\s*pin|card\s*pin|bank\s*pin|secret\s*pin|4[- ]?digit\s*pin|6[- ]?digit\s*pin|pin|otp|one[- ]?time\s*pass(?:word|code)|password|passcode|cvv)\b/i;

const SECRET_PASSIVE_REQUEST_EN =
  /\b(?:upi\s*pin|atm\s*pin|mpin|tpin|m-pin|t-pin|debit\s*pin|card\s*pin|bank\s*pin|secret\s*pin|4[- ]?digit\s*pin|6[- ]?digit\s*pin|otp|one[- ]?time\s*pass(?:word|code)|password|passcode|cvv)\b\s+(?:is\s+(?:required|needed)|required\s+to|needed\s+to|to\s+(?:unlock|verify|confirm|claim|receive|withdraw|activate|complete))\b/i;

const SECRET_ASSIGNMENT_PATTERN =
  /\b(?:upi\s*pin|atm\s*pin|mpin|tpin|pin|otp|password|passcode|cvv)\b(?=\s*[:=])/i;

const SECRET_ACTION_INDIC =
  /(?:OTP|ओटीपी|UPI\s*PIN|UPI\s*पिन|पिन|पासवर्ड|PIN|CVV)[^.!?\n।]{0,35}(?:शेयर\s+करें|साझा\s+करें|भेजें|बताएं|डालें|पाठवा|सांगा|शेअर\s+करा|பகிரவும்|அனுப்பவும்)/i;

const REMOTE_ACCESS_REQUEST =
  /\b(?:install|download|open|use|connect\s+(?:on|via)|share\s+(?:code|id)\s+(?:from|on))\s+(?:the\s+)?(anydesk|teamviewer|quicksupport)\b/i;

const NON_GUARANTEED_RETURN_CLAUSE =
  /\b(?:not|never|no|neither|nor|cannot|can't|doesn't|does\s+not|do\s+not|don't|aren't|are\s+not|isn't|is\s+not|without(?:\s+any)?|forbids?|prohibits?|bans?)\b.{0,45}\b(?:guarantee[ds]?|assured|fixed|risk[- ]?free|sure[- ]?shot|zero[- ]?loss|constant)\b|\b(?:beware\s+of|be\s+(?:careful|cautious|wary|alert)\s+(?:when(?:ever)?|if|around|about)|watch\s+out\s+(?:for|when(?:ever)?|if)|avoid|red\s+flag|warning\s*:|caution|fraud(?:sters?)?|scam(?:s|mers?)?|false\s+promise|misleading|remember\s+that|never\s+trust|no\s+such\s+thing\s+as|past\s+performance)\b|\b(?:word|term|phrase)s?\s+(?:like\s+)?["'“”]?guaranteed["'“”]?|(?:गारंटी\s+नहीं|निश्चित\s+नहीं|जोखिम\s+के\s+अधीन|हमी\s+नसते|உறுதியான\s+லாபம்\s+இல்லை)|\bno\s+(?:est[aá]n?\s+)?garantizad|\bsin\s+garant[ií]a\b/i;

const RETURN_PROMISE_PATTERN =
  /\b(?:guaranteed(?:\s+(?:return|returns|profit|profits|income|payout|gains?))?|sure[- ]?shot(?:\s+(?:tip|call|profit|returns?))?|risk[- ]?free(?:\s+(?:return|returns|profit|profits|trading|income))?|fixed\s+(?:return|returns|monthly\s+profit|income)|zero[- ]?loss|double\s+your\s+money|assured\s+(?:profit|returns?|income))\b|\b100%\s*(?:profit|return|returns|guaranteed|safe\s+(?:return|profit|income))\b|(?:पक्का\s+मुनाफा|गारंटीड\s+रिटर्न|निश्चित\s+लाभ|पैसा\s+डबल|हमखास\s+नफा)|\b(?:retorno\s+garantizado|ganancias?\s+garantizadas?|sin\s+riesgo)\b/i;

const MULTIPLIER_PROMISE_PATTERN =
  /(?:\b\d{2,3}\s*%(?:\s*(?:per|a|every)?\s*(?:month|week|day|daily|monthly)|(?=\s+(?:guaranteed|assured|fixed|profit|profits|return|returns|monthly|daily|weekly)))|\b(?:2x|3x|5x|10x)\b(?:\s*(?:return|returns|profit|profits|money))?)/i;

const ANTI_RUSH_CLAUSE =
  /\b(?:do\s+not|don't|never|no\s+need\s+to|avoid|stop)\b.{0,40}\b(?:rush|hurry|act\s+fast|pay\s+(?:immediately|urgently|right\s+away|now)|send\s+money\s+(?:now|urgently|immediately)|panic)\b|\b(?:take\s+your\s+time|pause\s+(?:and|before)|no\s+urgent\s+deadline|no\s+hurry|no\s+rush|false\s+urgency|artificial\s+urgency|pressure\s+tactic|beware|scam(?:mers?)?\s+(?:create|use)\s+(?:urgency|pressure))\b|(?:जल्दबाजी\s+न\s+करें|जल्दी\s+न\s+करें|तुरंत\s+पैसे\s+न\s+भेजें|रुकें\s+और\s+जांचें)|\b(?:no\s+te\s+apresures|sin\s+prisa|no\s+env[ií]es\s+dinero\s+con\s+prisa)\b/i;

const URGENCY_PRESSURE_PATTERN =
  /\b(?:urgent(?:ly)?|today\s+only|last\s+slot|limited\s+seats?|act\s+fast|within\s+\d+\s+(?:min|mins|minutes?|hour|hours?)|hurry(?:\s+up)?|closing\s+soon|pay\s+(?:now|immediately|right\s+away))\b|(?:तुरंत\s+भुगतान|तुरंत\s+पैसे\s+(?:भेजें|दें)|आज\s+(?:आखिरी|अंतिम)\s+मौका|आजच\s+पैसे\s+पाठवा)|\b(?:pago\s+urgente|act[uú]a\s+r[aá]pido|solo\s+por\s+hoy|solo\s+hoy)\b/i;

const EDUCATIONAL_WARNING_CLAUSE =
  /\b(?:never|do\s+not|don't|avoid|beware\s+of|warning\s*:|red\s+flag|scam(?:s|mers?)?|fraud(?:sters?)?|remember\s+that|no\s+(?:upfront|unlock|registration))\b|(?:सावधान|चेतावनी|न\s+करें|न\s+भेजें|नहीं\s+करना|नका|வேண்டாம்|\bnunca\b|\bno\s+(?:pagues|instales|descargues|entres)\b)/i;

const VIP_PATTERN =
  /\b(vip group|institutional desk|block deal|pre[- ]?ipo|upper circuit|insider|operator|jackpot)\b/i;

const GROUP_APP_PATTERN =
  /\b(join\s+(?:our|the|this)?\s*(?:whatsapp|telegram|vip|trading|stock)\s*(?:group|channel|desk)|(?:move|switch|continue|chat|talk|connect|contact\s+me)\s+(?:privately\s+)?(?:on|to)\s+(?:whatsapp|telegram)|telegram\s+(?:group|channel|id|handle)|whatsapp\s+(?:group|chat|number)|dm\s+me|message\s+me\s+on\s+(?:whatsapp|telegram)|download\s+(?:this|the|our)?\s*(?:app|apk)|install\s+(?:this|the|our)?\s*(?:app|apk))\b/i;

const FEES_PATTERN =
  /\b(processing fee|registration fee|unlock\s*(?:fee|charge)|withdrawal fee|margin\s*(?:money|top[- ]?up|deposit)|pay\s+(?:tax|gst)\s+(?:first|before|to withdraw)|deposit\s+(?:tax|gst))\b/i;

// ---- Extra scam stories (digital arrest, task fraud, crypto platforms, deepfake ads, Hinglish) ----

type PitchKey =
  | 'pitchSecretRequest'
  | 'pitchPinToReceive'
  | 'pitchGuaranteed'
  | 'pitchMultiplier'
  | 'pitchUrgency'
  | 'pitchVip'
  | 'pitchGroupApp'
  | 'pitchFees'
  | 'pitchAuthorityThreat'
  | 'pitchSafeAccount'
  | 'pitchTaskFraud'
  | 'pitchCryptoPlatform'
  | 'pitchDeepfake';

/** Explanation text for a warning; keys that only exist in en.ts fall back to English in other languages. */
const pitchText = (a: AnalyzerCopy, key: PitchKey): string =>
  (a[key] as string | undefined) ?? (TRANSLATIONS.en.analyzer[key] as string);

// Awareness or advice text ("police never ask you to transfer money", "fraudsters pretend to be CBI") is not a scam.
const ADVISORY_GUARD =
  /\b(?:beware|warning\s*:|red\s+flags?|awareness|how\s+to\s+(?:spot|avoid|identify)|(?:genuine|real|actual|legitimate)\s+(?:agencies|police|officials|officers|banks?|brokers?)\s+(?:never|do\s+not|don't|will\s+not|won't)|(?:police|cbi|rbi|sebi|banks?|agencies)\s+(?:will\s+)?never\s+(?:ask|call|demand|request|threaten)|never\s+(?:ask|demand|request)\s+(?:you\s+)?(?:to|for)|(?:is|are)\s+(?:a\s+)?(?:scam|fraud)|scam(?:s|mers?)?\s+(?:often|usually|typically|will|can|may|use|claim|pretend|impersonate|ask|call|say|tell|demand|threaten|promote|advertise|offer|lure|run|operate|push|spread)|fraudsters?\s+(?:often|usually|typically|will|can|may|use|claim|pretend|impersonate|ask|call|say|tell|demand|threaten|promote|advertise|offer|lure|run|operate|push|spread))\b/i;

const AUTHORITY_THREAT_PATTERN =
  /\b(?:digital\s+arrest|(?:cbi|enforcement\s+directorate|narcotics(?:\s+(?:bureau|control))?|ncb|customs|cyber\s*(?:crime|cell)|crime\s+branch|police|trai|income\s+tax|supreme\s+court)\b[\s\S]{0,160}?\b(?:arrest(?:ed)?|warrant|money\s+laundering|illegal\s+(?:parcel|transaction|activity)|fir\s+(?:is\s+|has\s+been\s+)?(?:registered|filed|lodged)|case\s+(?:is\s+|has\s+been\s+)?(?:registered|filed)))/i;
// The message must speak to the reader ("you", "your"), which keeps news about police cases from matching.
const SECOND_PERSON_CUE = /\b(?:you|your|you're|aap|aapke|aapka)\b/i;
const AUTHORITY_EVIDENCE =
  /\b(?:digital\s+arrest|arrest(?:ed)?\s+warrant|money\s+laundering|arrest|warrant|cbi|enforcement\s+directorate|narcotics|customs|crime\s+branch|cyber\s*(?:crime|cell))\b/i;

const SAFE_ACCOUNT_PATTERN =
  /\b(?:safe|verification|rbi|government|escrow|supervision)\s+account\b[\s\S]{0,80}?\b(?:transfer|deposit|send|pay)\w*|\b(?:transfer|deposit|send|pay)\w*\b[\s\S]{0,80}?\b(?:safe|verification|rbi|government|escrow|supervision)\s+account\b/i;
const SAFE_ACCOUNT_EVIDENCE = /\b(?:safe|verification|rbi|government|escrow|supervision)\s+account\b/i;

const TASK_FRAUD_PATTERNS: RegExp[] = [
  /\b(?:like|subscribe(?:\s+to)?|rate|review|follow|watch)\b\s+(?:and\s+\w+\s+)?(?:\w+\s+){0,3}(?:videos?|posts?|reels?|products?|hotels?|channels?|apps?|ads?)\b[\s\S]{0,120}?\b(?:earn|income|salary|pay(?:ment|out)?|commission|reward)\b/i,
  /\b(?:earn|income|commission)\b[\s\S]{0,60}?\b(?:lik(?:e|ing)|subscrib(?:e|ing)|rat(?:e|ing)|review(?:ing)?|watch(?:ing)?)\b\s+(?:\w+\s+){0,3}(?:videos?|posts?|reels?|products?|hotels?|channels?|apps?|ads?)\b/i,
  /\b(?:deposit|recharge|pay|invest|top[- ]?up|add)\b[\s\S]{0,50}?\bto\s+(?:unlock|upgrade|activate|withdraw|complete|continue)\b[\s\S]{0,30}?\b(?:tasks?|levels?|orders?|commission|account|withdrawal)\b/i,
  /\b(?:(?:higher|next|premium|vip)\s+(?:tasks?|levels?)|prepaid\s+tasks?|task\s+(?:order|commission|level))\b/i,
  /\bpart[- ]?time\s+(?:job|work)\b[\s\S]{0,80}?\b(?:earn|daily|per\s+day|salary|₹|rs\.?)/i,
  /\b(?:earn|make)\s+(?:rs\.?\s*|₹\s*|inr\s*)?\d[\d,]*\s*(?:\/-\s*)?(?:per\s+day|daily|a\s+day|\/day)\b/i,
];

const CRYPTO_PLATFORM_PATTERN =
  /\b(?:crypto(?:currency)?|bitcoin|usdt|forex|ai\s+trading\s+(?:bot|platform|app)|trading\s+(?:app|platform|bot)|investment\s+platform)\b[\s\S]{0,120}?(?:\b(?:daily|weekly)\s+\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*%\s*(?:daily|per\s+day|a\s+day|weekly|per\s+week)|\bwithdraw(?:al)?\s+(?:anytime|any\s+time|instantly)|\bguaranteed\b)/i;
const INSIDER_STORY_PATTERN =
  /\b(?:internal|insider|inside)\s+(?:info(?:rmation)?|tips?|source|team|channel)\b|\b(?:uncle|aunt|cousin|friend|brother|sister)\b[\s\S]{0,40}?\b(?:analyst|works?\s+(?:at|in|for)|insider)\b[\s\S]{0,60}?\b(?:invest|profit|platform|trading|returns?)\b|\bi\s+am\s+a\s+(?:trader|analyst|investor|fund\s+manager)\s+from\s+(?:singapore|dubai|hong\s*kong|malaysia|london|usa|uk)\b/i;
const CRYPTO_EVIDENCE =
  /\b(?:crypto(?:currency)?|bitcoin|usdt|forex|ai\s+trading\s+(?:bot|platform|app)|trading\s+(?:app|platform|bot)|investment\s+platform|withdraw(?:al)?\s+(?:anytime|any\s+time|instantly)|(?:daily|weekly)\s+\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*%\s*(?:daily|per\s+day|a\s+day))\b/i;

const DEEPFAKE_PATTERN =
  /\b(?:finance\s+minister|nirmala\s+sitharaman|prime\s+minister|narendra\s+modi|mukesh\s+ambani|ratan\s+tata|sudha\s+murty|narayana\s+murthy|sadhguru|shark\s+tank|elon\s+musk)\b[\s\S]{0,100}?\b(?:recommend(?:s|ed|ing)?|endorse[sd]?|launch(?:ed|es)?|reveals?|shares?|announce[sd]?)\b[\s\S]{0,80}?\b(?:app|platform|bot|scheme|trading|invest\w*|earn\w*|profit\w*|returns?)\b/i;
const DEEPFAKE_PROMO_CUE =
  /\b(?:click|watch|join|link|download|register|whatsapp|telegram|limited|earn|guaranteed|profit|bonus|deposit|invest\s+(?:now|today|just|only)|sign\s*up)\b/i;
const DEEPFAKE_EVIDENCE =
  /\b(?:finance\s+minister|nirmala\s+sitharaman|prime\s+minister|narendra\s+modi|mukesh\s+ambani|ratan\s+tata|sudha\s+murty|narayana\s+murthy|sadhguru|shark\s+tank|elon\s+musk)\b[\s\S]{0,40}?\b(?:recommend\w*|endorse\w*|launch\w*|reveals?|shares?|announce\w*)\b/i;

// Lakh / crore income promises, e.g. "earn 3 lakh monthly".
const LAKH_PROMISE_PATTERN =
  /\b(?:earn|make)\s+(?:rs\.?\s*|₹\s*)?\d+(?:\.\d+)?\s*(?:lakhs?|crores?)\s*(?:per\s+|a\s+|every\s+)?(?:month|monthly|week|weekly|day|daily)\b/i;

// Hinglish (Hindi written in English letters).
const HINGLISH_PROMISE_PATTERN =
  /\b(?:(?:pakka|pukka|pakki)\s+(?:profit|munafa|munaafa|return|returns|paisa|milega)|(?:profit|munafa|munaafa|paisa|paise)\s+(?:pakka|guaranteed|double|milega)|paisa\s+double|(?:koi|zero|bina)\s+risk(?:\s+nahi)?|risk\s+nahi\s+hai|guaranteed\s+(?:munafa|profit))\b/i;
const HINGLISH_URGENCY_PATTERN =
  /\b(?:aaj\s+hi\s+(?:paisa|paise|payment|invest|join|daalo|dalo|bhejo|pay|deposit)|abhi\s+(?:paisa|payment|pay|bhejo|daalo|dalo)|jaldi\s+(?:karo|bhejo|paisa)|turant\s+(?:paisa|payment|bhejo)|sirf\s+aaj)\b/i;
const HINGLISH_FEES_PATTERN =
  /\b(?:ipo|allotment|registration|demat|kyc|processing|unlock|margin)\b[\s\S]{0,40}?\b\d[\d,]*\s*(?:rupay|rupaye|rupees|rs\.?|₹)?\s*(?:bhejo|bhej\s+do|daalo|dalo|jama\s+karo|transfer\s+karo|pay\s+karo)\b|\b\d[\d,]*\s*(?:rupay|rupaye|rupees)\s+(?:bhejo|bhej\s+do|daalo|dalo|jama\s+karo)\b/i;

function evidenceOf(text: string, evidence: RegExp): string {
  return text.match(evidence)?.[0] ?? text.slice(0, 60);
}

export {
  ANTI_RUSH_CLAUSE,
  EDUCATIONAL_WARNING_CLAUSE,
  FEES_PATTERN,
  GROUP_APP_PATTERN,
  MULTIPLIER_PROMISE_PATTERN,
  NON_GUARANTEED_RETURN_CLAUSE,
  RETURN_PROMISE_PATTERN,
  SEBI_REGEX,
  SENDER_REASSURANCE_STRIP,
  UPI_REGEX,
  URGENCY_PRESSURE_PATTERN,
  VIP_PATTERN,
};

export interface SentenceUnit {
  raw: string;
  isQuestion: boolean;
}

export function splitSentencesAndClauses(text: string): SentenceUnit[] {
  const units: SentenceUnit[] = [];
  const sentenceRegex = /([^.!?\n\r;।|]+)([.!?।]?)/g;
  let match: RegExpExecArray | null;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const rawSentence = match[1].trim();
    if (!rawSentence) continue;
    const isQuestion = match[2] === '?';

    // Split independent clauses joined by dashes or coordinating conjunctions so protective advice in one clause never hides a scam pitch in the next
    const subClauses = rawSentence
      .split(
        /\s*[—–]\s*|,\s+(?=(?:and|but|also|however|yet|while|so|please|just|share|send|enter|pay|earn|get|join|never|do not|don't|लेकिन|और|पर|किंतु|y|pero)\b)/i
      )
      .map((c) => c.trim())
      .filter(Boolean);

    for (const clause of subClauses) {
      units.push({ raw: clause, isQuestion });
    }
  }

  return units;
}

export function stripSenderReassurance(clause: string): string {
  return clause.replace(SENDER_REASSURANCE_STRIP, ' ').replace(/\s+/g, ' ').trim();
}

function redactSecretValues(text: string): string {
  return redactSensitiveText(text, { maskPaymentHandles: false });
}

export function detectPinToReceivePhrase(clause: string): string | null {
  const cleaned = stripSenderReassurance(clause);
  if (!cleaned) return null;
  if (PROTECTIVE_SECRET_CLAUSE.test(cleaned) || EDUCATIONAL_WARNING_CLAUSE.test(cleaned)) {
    return null;
  }
  const match = cleaned.match(PIN_TO_RECEIVE_PATTERN);
  return match?.[0] ? match[0].replace(/\s+/g, ' ').trim() : null;
}

export function detectSecretRequestPhrase(clause: string): string | null {
  const cleaned = stripSenderReassurance(clause);
  if (!cleaned) return null;

  if (PROTECTIVE_SECRET_CLAUSE.test(cleaned)) {
    return null;
  }

  // Descriptive mention (e.g. "banks send an OTP", "UPI and OTP help verify") without asking user to hand it over
  if (
    DESCRIPTIVE_SECRET_CLAUSE.test(cleaned) &&
    !/\b(?:share|tell|give|forward|dm)\b/i.test(cleaned) &&
    !/\bsend\s+(?:us|me|your|the)\s+(?:otp|pin|password|cvv)\b/i.test(cleaned)
  ) {
    return null;
  }

  const enEsMatch = cleaned.match(SECRET_ACTION_REQUEST_EN_ES);
  if (enEsMatch?.[0]) {
    return enEsMatch[0].replace(/\s+/g, ' ').trim();
  }

  const passiveMatch = cleaned.match(SECRET_PASSIVE_REQUEST_EN);
  if (passiveMatch?.[0]) {
    return passiveMatch[0].replace(/\s+/g, ' ').trim();
  }

  const indicMatch = cleaned.match(SECRET_ACTION_INDIC);
  if (indicMatch?.[0]) {
    return indicMatch[0].replace(/\s+/g, ' ').trim();
  }

  const remoteMatch = cleaned.match(REMOTE_ACCESS_REQUEST);
  if (remoteMatch?.[0]) {
    return remoteMatch[0].replace(/\s+/g, ' ').trim();
  }

  const assignMatch = cleaned.match(SECRET_ASSIGNMENT_PATTERN);
  if (assignMatch?.[0]) {
    return assignMatch[0].replace(/\s+/g, ' ').trim();
  }

  return null;
}

function sanitizeExtractedDetail(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (
    SECRET_NOUN_PATTERN.test(trimmed) &&
    (/\b(?:pin|otp|password|passcode|cvv)\s*[:=\-]?\s*\S+/i.test(trimmed) ||
      Boolean(detectSecretRequestPhrase(trimmed)))
  ) {
    return undefined;
  }
  return redactSecretValues(trimmed);
}

export function parseAmountInr(raw: string): number | null {
  if (!raw || !raw.trim()) return null;
  const cleaned = raw.replace(/[₹,\s]/g, '').replace(/\/-$/, '');
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function analyzeMessagePillar(text: string): PillarFinding {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      id: 'message',
      status: 'not_provided',
      checkBasis: 'not_provided',
      statusLabel: loc((a) => a.msgNotProvidedLabel),
      headline: loc((a) => a.msgNotProvidedHeadline),
      explanation: loc((a) => a.msgNotProvidedDesc),
    };
  }

  const units = splitSentencesAndClauses(trimmed);
  const warnings: PillarWarningDetail[] = [];
  const seenKeys = new Set<string>();
  let hasHighRisk = false;
  let asksForSecret = false;

  const pushWarning = (
    id: string,
    phrase: string,
    explanationKey: PitchKey,
    isHigh: boolean
  ) => {
    const rawCleaned = redactSecretValues(phrase.replace(/\s+/g, ' ').trim());
    const cleanPhrase =
      id === 'secret-request' || id === 'pin-to-receive'
        ? rawCleaned.replace(/\b\d{4,8}\b/g, '[redacted]')
        : rawCleaned;
    if (!cleanPhrase) return;
    if (isHigh) hasHighRisk = true;
    const dedupeKey = `${id}:${cleanPhrase.toLowerCase()}`;
    if (!seenKeys.has(dedupeKey) && warnings.length < 5) {
      seenKeys.add(dedupeKey);
      warnings.push({
        id,
        phrase: cleanPhrase,
        explanation: loc((a) => pitchText(a, explanationKey)),
      });
    }
  };

  for (const unit of units) {
    const cleaned = stripSenderReassurance(unit.raw);
    if (!cleaned) continue;

    // 1a. PIN-to-receive / QR-to-receive deception vs protective/educational mention
    const pinReceivePhrase = detectPinToReceivePhrase(unit.raw);
    if (pinReceivePhrase) {
      asksForSecret = true;
      pushWarning('pin-to-receive', pinReceivePhrase, 'pitchPinToReceive', true);
    } else {
      // 1b. Secret request vs protective/descriptive mention
      const secretPhrase = detectSecretRequestPhrase(unit.raw);
      if (secretPhrase) {
        asksForSecret = true;
        pushWarning('secret-request', secretPhrase, 'pitchSecretRequest', true);
      }
    }

    // 2. Return promises vs explaining returns are not guaranteed
    const nonGuaranteed =
      NON_GUARANTEED_RETURN_CLAUSE.test(cleaned) ||
      (unit.isQuestion && !/\b(?:earn|get|make|unlock|join|pay|deposit)\b/i.test(cleaned));

    if (!nonGuaranteed) {
      const guaranteedMatch = cleaned.match(RETURN_PROMISE_PATTERN)?.[0];
      if (guaranteedMatch) {
        pushWarning('guaranteed-return', guaranteedMatch, 'pitchGuaranteed', true);
      }
      const hinglishMatch = cleaned.match(HINGLISH_PROMISE_PATTERN)?.[0];
      if (hinglishMatch && !guaranteedMatch) {
        pushWarning('guaranteed-return', hinglishMatch, 'pitchGuaranteed', true);
      }
      const multiplierMatch = cleaned.match(MULTIPLIER_PROMISE_PATTERN)?.[0];
      if (multiplierMatch) {
        pushWarning('high-yield', multiplierMatch, 'pitchMultiplier', true);
      }
      const lakhMatch = cleaned.match(LAKH_PROMISE_PATTERN)?.[0];
      if (lakhMatch) {
        pushWarning('high-yield', lakhMatch, 'pitchMultiplier', true);
      }
    }

    // 3. Urgent pressure to pay vs safety warning telling someone not to rush
    if (!ANTI_RUSH_CLAUSE.test(cleaned)) {
      const urgencyMatch =
        cleaned.match(URGENCY_PRESSURE_PATTERN)?.[0] ?? cleaned.match(HINGLISH_URGENCY_PATTERN)?.[0];
      if (urgencyMatch) {
        pushWarning('urgency', urgencyMatch, 'pitchUrgency', true);
      }
    }

    // 4. VIP / off-platform group / upfront fees (skip educational warnings)
    if (!EDUCATIONAL_WARNING_CLAUSE.test(cleaned)) {
      const vipMatch = cleaned.match(VIP_PATTERN)?.[0];
      if (vipMatch) {
        pushWarning('vip-pitch', vipMatch, 'pitchVip', true);
      }

      const groupAppMatch = cleaned.match(GROUP_APP_PATTERN)?.[0];
      if (groupAppMatch) {
        pushWarning('group-app', groupAppMatch, 'pitchGroupApp', false);
      }

      const feesMatch = cleaned.match(FEES_PATTERN)?.[0] ?? cleaned.match(HINGLISH_FEES_PATTERN)?.[0];
      if (feesMatch) {
        pushWarning('upfront-fees', feesMatch, 'pitchFees', false);
      }
    }
  }

  // Scam stories that span several sentences are checked on the whole message, because the threat and
  // the payment demand usually sit in different sentences. Advice and awareness text is skipped.
  if (!ADVISORY_GUARD.test(trimmed)) {
    if (AUTHORITY_THREAT_PATTERN.test(trimmed) && SECOND_PERSON_CUE.test(trimmed)) {
      pushWarning('authority-threat', evidenceOf(trimmed, AUTHORITY_EVIDENCE), 'pitchAuthorityThreat', true);
    }
    if (SAFE_ACCOUNT_PATTERN.test(trimmed)) {
      pushWarning('safe-account', evidenceOf(trimmed, SAFE_ACCOUNT_EVIDENCE), 'pitchSafeAccount', true);
    }
    if (TASK_FRAUD_PATTERNS.some((re) => re.test(trimmed))) {
      const hit = TASK_FRAUD_PATTERNS.map((re) => trimmed.match(re)?.[0]).find(Boolean) as string;
      pushWarning('task-fraud', hit.length > 70 ? hit.slice(0, 70).replace(/\s+\S*$/, '') : hit, 'pitchTaskFraud', true);
    }
    if (CRYPTO_PLATFORM_PATTERN.test(trimmed)) {
      pushWarning('crypto-platform', evidenceOf(trimmed, CRYPTO_EVIDENCE), 'pitchCryptoPlatform', true);
    } else if (INSIDER_STORY_PATTERN.test(trimmed)) {
      pushWarning('crypto-platform', evidenceOf(trimmed, INSIDER_STORY_PATTERN), 'pitchCryptoPlatform', false);
    }
    if (DEEPFAKE_PATTERN.test(trimmed) && DEEPFAKE_PROMO_CUE.test(trimmed)) {
      pushWarning('deepfake-endorsement', evidenceOf(trimmed, DEEPFAKE_EVIDENCE), 'pitchDeepfake', true);
    }
  }

  if (warnings.length > 0) {
    const evidencePhrases = Array.from(new Set(warnings.map((w) => w.phrase)));
    const uniqueExplanationKeys = Array.from(new Set(warnings.map((w) => w.id)));
    const keyMap: Record<string, PitchKey> = {
      'pin-to-receive': 'pitchPinToReceive',
      'secret-request': 'pitchSecretRequest',
      'guaranteed-return': 'pitchGuaranteed',
      'high-yield': 'pitchMultiplier',
      urgency: 'pitchUrgency',
      'vip-pitch': 'pitchVip',
      'group-app': 'pitchGroupApp',
      'upfront-fees': 'pitchFees',
      'authority-threat': 'pitchAuthorityThreat',
      'safe-account': 'pitchSafeAccount',
      'task-fraud': 'pitchTaskFraud',
      'crypto-platform': 'pitchCryptoPlatform',
      'deepfake-endorsement': 'pitchDeepfake',
    };

    const explanationLocs = uniqueExplanationKeys
      .slice(0, 3)
      .map((id) => keyMap[id])
      .filter(Boolean);

    return {
      id: 'message',
      status: hasHighRisk ? 'high_risk' : 'caution',
      checkBasis: 'pattern_clues',
      statusLabel: loc((a) => (hasHighRisk ? a.msgHighLabel : a.msgCautionLabel)),
      headline: loc((a) =>
        asksForSecret ? a.msgSecretHeadline : hasHighRisk ? a.msgHighHeadline : a.msgCautionHeadline
      ),
      explanation: loc((a) => explanationLocs.map((k) => pitchText(a, k)).join(' ')),
      evidencePhrases,
      warnings,
    };
  }

  return {
    id: 'message',
    status: 'cant_verify',
    checkBasis: 'pattern_clues',
    statusLabel: loc((a) => a.msgNoSignsLabel),
    headline: loc((a) => a.msgNoSignsHeadline),
    explanation: loc((a) => a.msgNoSignsDesc),
  };
}

export function analyzeSebiPillar(sebiClaim: string): PillarFinding {
  const trimmed = sebiClaim.trim();
  if (!trimmed) {
    return {
      id: 'sebi',
      status: 'not_provided',
      checkBasis: 'not_provided',
      statusLabel: loc((a) => a.sebiMissingLabel),
      headline: loc((a) => a.sebiMissingHeadline),
      explanation: loc((a) => a.sebiMissingDesc),
    };
  }

  const matchedId = trimmed.match(SEBI_REGEX)?.[0]?.toUpperCase();
  if (matchedId) {
    return {
      id: 'sebi',
      status: 'cant_verify',
      checkBasis: 'format_only',
      statusLabel: loc((a) => a.sebiValidLabel),
      headline: loc((a) => a.sebiValidHeadline(matchedId)),
      explanation: loc((a) => a.sebiValidDesc),
      isDemoOnlyNote: loc((a) => a.sebiValidDemo),
      extractedDetail: matchedId,
      evidencePhrases: [matchedId],
    };
  }

  const looksLikeBrokenCode = /\bIN[A-Z0-9-]{4,}\b/i.test(trimmed) || /\bSEBI\b/i.test(trimmed);
  const safeDetail = sanitizeExtractedDetail(trimmed);
  return {
    id: 'sebi',
    status: looksLikeBrokenCode ? 'high_risk' : 'cant_verify',
    checkBasis: 'format_only',
    statusLabel: loc((a) => (looksLikeBrokenCode ? a.sebiMismatchLabel : a.sebiNameOnlyLabel)),
    headline: loc((a) => (looksLikeBrokenCode ? a.sebiMismatchHeadline : a.sebiNameOnlyHeadline)),
    explanation: loc((a) => (looksLikeBrokenCode ? a.sebiMismatchDesc : a.sebiNameOnlyDesc)),
    isDemoOnlyNote: loc((a) => a.sebiCantVerifyDemo),
    extractedDetail: safeDetail,
    evidencePhrases: safeDetail ? [safeDetail] : undefined,
    warnings:
      looksLikeBrokenCode && safeDetail
        ? [
            {
              id: 'sebi-format',
              phrase: safeDetail,
              explanation: loc((a) => a.sebiMismatchDesc),
            },
          ]
        : undefined,
  };
}

export function analyzeLinkPillar(websiteLink: string): PillarFinding {
  const trimmed = websiteLink.trim();
  if (!trimmed) {
    return {
      id: 'link',
      status: 'not_provided',
      checkBasis: 'not_provided',
      statusLabel: loc((a) => a.linkNotProvidedLabel),
      headline: loc((a) => a.linkNotProvidedHeadline),
      explanation: loc((a) => a.linkNotProvidedDesc),
    };
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL | null = null;
  try {
    parsed = new URL(normalized);
  } catch {
    parsed = null;
  }

  const lower = trimmed.toLowerCase();
  const host = parsed ? parsed.hostname.toLowerCase() : lower;

  // 1. APK / direct app download outside official app stores
  const apkMatch = lower.match(/\.apk\b|download[-_]?app/i)?.[0];
  if (/\.apk(\?|$|#)/i.test(lower) || /\bdownload[-_]?app\b/i.test(lower)) {
    const phrase = apkMatch || host;
    return {
      id: 'link',
      status: 'high_risk',
      checkBasis: 'pattern_clues',
      statusLabel: loc((a) => a.linkHighLabel),
      headline: loc((a) => a.linkApkHeadline),
      explanation: loc((a) => a.linkApkDesc),
      extractedDetail: host,
      evidencePhrases: apkMatch ? [host, apkMatch] : [host],
      warnings: [
        {
          id: 'link-apk',
          phrase,
          explanation: loc((a) => a.linkApkDesc),
        },
      ],
    };
  }

  // 2. IP address URL or insecure HTTP
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const isInsecureHttp = /^http:\/\//i.test(trimmed);

 // 3. Lookalike or hyphenated brand/authority spoofing (official hosts and real subdomains are exempt)
const lookalike = detectLookalike(host);
const spoofWord =
  lookalike?.token ?? host.match(/(ipo-allot|vip-trade|wealth-desk|institutional|angel)/i)?.[0];
const isOfficialDomain = isOfficialHost(host);

  if (isIpHost || (spoofWord && !isOfficialDomain)) {
    return {
      id: 'link',
      status: 'high_risk',
      checkBasis: 'pattern_clues',
      statusLabel: loc((a) => a.linkHighLabel),
      headline: loc((a) => a.linkSpoofHeadline),
      explanation: loc((a) => a.linkSpoofDesc),
      isDemoOnlyNote: loc((a) => a.linkDemoDomain),
      extractedDetail: host,
      evidencePhrases: spoofWord ? [host, spoofWord] : [host],
      warnings: [
        {
          id: 'link-spoof',
          phrase: host,
          explanation: loc((a) => a.linkSpoofDesc),
        },
      ],
    };
  }

  const matchedShortener = SHORTENER_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`));
  const riskyTld = !isOfficialDomain && hasSuspiciousTld(host);
  if (matchedShortener || isInsecureHttp || riskyTld) {
    const phrase = matchedShortener || (isInsecureHttp ? 'http://' : `.${host.split('.').pop()}`);
    return {
      id: 'link',
      status: 'caution',
      checkBasis: 'pattern_clues',
      statusLabel: loc((a) => a.linkCautionLabel),
      headline: matchedShortener
        ? loc((a) => a.linkShortenerHeadline)
        : isInsecureHttp
          ? loc((a) => a.linkHttpHeadline)
          : locOpt('linkTldHeadline'),
      explanation: matchedShortener
        ? loc((a) => a.linkShortenerDesc)
        : isInsecureHttp
          ? loc((a) => a.linkHttpDesc)
          : locOpt('linkTldDesc'),
      extractedDetail: host,
      evidencePhrases: [phrase],
      warnings: [
        {
          id: 'link-caution',
          phrase,
          explanation: matchedShortener
            ? loc((a) => a.linkShortenerDesc)
            : isInsecureHttp
              ? loc((a) => a.linkHttpDesc)
              : locOpt('linkTldDesc'),
        },
      ],
    };
  }

  return {
    id: 'link',
    status: 'cant_verify',
    checkBasis: 'unverified_live',
    statusLabel: loc((a) => a.linkCantVerifyLabel),
    headline: loc((a) => a.linkCantVerifyHeadline(host)),
    explanation: loc((a) => a.linkCantVerifyDesc),
    isDemoOnlyNote: loc((a) => a.linkDemoReputation),
    extractedDetail: host,
    evidencePhrases: [host],
  };
}

function isValidSeBiUpiSuffix(suffix: string): boolean {
  const lower = suffix.toLowerCase();
  return lower === 'valid' || lower.startsWith('valid') || lower.endsWith('.valid');
}

export function analyzePaymentPillar(
  paymentDetail: string,
  requestedAmountInr: string,
  hasInvestmentPitch: boolean
): PillarFinding {
  const trimmed = paymentDetail.trim();
  const amount = parseAmountInr(requestedAmountInr);

  if (!trimmed && !amount) {
    return {
      id: 'payment',
      status: 'not_provided',
      checkBasis: 'not_provided',
      statusLabel: loc((a) => a.payNotProvidedLabel),
      headline: loc((a) => a.payNotProvidedHeadline),
      explanation: loc((a) => a.payNotProvidedDesc),
    };
  }

  const upiMatch = trimmed.match(UPI_REGEX)?.[0];
  const handleSuffix = upiMatch ? upiMatch.split('@')[1]?.toLowerCase() ?? '' : '';
  const isClaimedValidUpi = handleSuffix ? isValidSeBiUpiSuffix(handleSuffix) : false;
  const personalKeyword = trimmed.match(
    /\b(personal|savings|friend|manager|agent|account holder|imps|neft)\b/i
  )?.[0];
  const mentionsPersonalAccount =
    Boolean(personalKeyword) || /^\d{9,18}$/.test(trimmed.replace(/\s+/g, ''));

  if (mentionsPersonalAccount && hasInvestmentPitch) {
    const amountText = amount ? formatInr(amount) : '';
    const safeUpi = upiMatch ? sanitizeExtractedDetail(upiMatch) : undefined;
    const safeTrimmed = sanitizeExtractedDetail(trimmed);
    const evidence = Array.from(
      new Set([safeUpi, personalKeyword, amountText || undefined].filter(Boolean) as string[])
    );
    const mainPhrase = safeUpi || personalKeyword || safeTrimmed || amountText;
    return {
      id: 'payment',
      status: 'high_risk',
      checkBasis: 'pattern_clues',
      statusLabel: loc((a) => a.payHighLabel),
      headline: loc((a) =>
        safeUpi && personalKeyword ? a.payPersonalUpiHeadline(safeUpi) : a.payPersonalAccountHeadline
      ),
      explanation: loc((a) => a.payPersonalDesc(amountText)),
      isDemoOnlyNote: loc((a) => a.payDemoLookup),
      extractedDetail: safeUpi || safeTrimmed,
      evidencePhrases: evidence.length > 0 ? evidence : undefined,
      warnings: mainPhrase
        ? [
            {
              id: 'payment-personal',
              phrase: mainPhrase,
              explanation: loc((a) => a.payPersonalDesc(amountText)),
            },
          ]
        : undefined,
    };
  }

  if (upiMatch && isClaimedValidUpi) {
    const safeUpi = sanitizeExtractedDetail(upiMatch) ?? upiMatch;
    const amountText = amount ? formatInr(amount) : '';
    const evidence = [safeUpi, amountText].filter(Boolean) as string[];
    return {
      id: 'payment',
      status: 'cant_verify',
      checkBasis: 'format_only',
      statusLabel: loc((a) => a.payValidUpiLabel),
      headline: loc((a) => a.payValidUpiHeadline(safeUpi)),
      explanation: loc((a) => a.payValidUpiDesc),
      isDemoOnlyNote: loc((a) => a.payDemoLookup),
      extractedDetail: safeUpi,
      evidencePhrases: evidence,
    };
  }

  if (upiMatch) {
    const safeUpi = sanitizeExtractedDetail(upiMatch) ?? upiMatch;
    const amountText = amount ? formatInr(amount) : '';
    const evidence = [safeUpi, amountText].filter(Boolean) as string[];
    return {
      id: 'payment',
      status: 'cant_verify',
      checkBasis: 'unverified_live',
      statusLabel: loc((a) => a.payCantVerifyLabel),
      headline: loc((a) => a.payNonValidUpiHeadline(safeUpi)),
      explanation: loc((a) => a.payNonValidUpiDesc),
      isDemoOnlyNote: loc((a) => a.payDemoLookup),
      extractedDetail: safeUpi,
      evidencePhrases: evidence,
    };
  }

  if (amount && !trimmed) {
    const formatted = formatInr(amount);
    return {
      id: 'payment',
      status: 'cant_verify',
      checkBasis: 'unverified_live',
      statusLabel: loc((a) => a.payCantVerifyLabel),
      headline: loc((a) => a.payAmountContextHeadline(formatted)),
      explanation: loc((a) => a.payAmountContextDesc),
      isDemoOnlyNote: loc((a) => a.payDemoNotConnected),
      extractedDetail: formatted,
      evidencePhrases: [formatted],
    };
  }

  const fallbackDetail =
    sanitizeExtractedDetail(trimmed) || (amount ? formatInr(amount) : undefined);
  return {
    id: 'payment',
    status: 'cant_verify',
    checkBasis: 'unverified_live',
    statusLabel: loc((a) => a.payCantVerifyLabel),
    headline: loc((a) => a.payCantVerifyHeadline),
    explanation: loc((a) => a.payCantVerifyDesc),
    isDemoOnlyNote: loc((a) => a.payDemoNotConnected),
    extractedDetail: fallbackDetail,
    evidencePhrases: fallbackDetail ? [fallbackDetail] : undefined,
  };
}

export function analyzeUnifiedCheck(input: MessageCheckInput): UnifiedCheckResult {
  const hasAnyInput =
    Boolean(input.messageText.trim()) ||
    Boolean(input.sebiClaim.trim()) ||
    Boolean(input.websiteLink.trim()) ||
    Boolean(input.paymentDetail.trim()) ||
    Boolean(parseAmountInr(input.requestedAmountInr));

  if (!hasAnyInput) {
    return {
      overallLevel: 'insufficient_data',
      overallTitle: loc((a) => a.unifiedEmptyTitle),
      overallSummary: loc((a) => a.unifiedEmptySummary),
      connectionInsight: loc((a) => a.unifiedEmptyInsight),
      pillars: [
        analyzeMessagePillar(''),
        analyzeSebiPillar(''),
        analyzeLinkPillar(''),
        analyzePaymentPillar('', '', false),
      ],
      nextSteps: [loc((a) => a.unifiedEmptyStep)],
      detectedSignalsCount: 0,
      demoLimitNote: loc((a) => a.unifiedEmptyDemo),
    };
  }

  const hasPitchContext = Boolean(input.messageText.trim() || input.sebiClaim.trim());
  const msgPillar = analyzeMessagePillar(input.messageText);
  const sebiPillar = analyzeSebiPillar(input.sebiClaim);
  const linkPillar = analyzeLinkPillar(input.websiteLink);
  const payPillar = analyzePaymentPillar(
    input.paymentDetail,
    input.requestedAmountInr,
    hasPitchContext
  );

  const pillars = [msgPillar, sebiPillar, linkPillar, payPillar];
  const highCount = pillars.filter((p) => p.status === 'high_risk').length;
  const cautionCount = pillars.filter((p) => p.status === 'caution').length;

  let overallLevel: RiskLevel = 'cant_verify';
  let overallTitle: LocalizedText;
  let overallSummary: LocalizedText;
  let connectionInsight: LocalizedText;

  if (highCount >= 1) {
    overallLevel = 'high_risk';
    overallTitle = loc((a) => a.unifiedHighTitle);
    overallSummary = loc((a) => a.unifiedHighSummary(highCount, cautionCount));
  } else if (cautionCount >= 1) {
    overallLevel = 'caution';
    overallTitle = loc((a) => a.unifiedCautionTitle);
    overallSummary = loc((a) => a.unifiedCautionSummary);
  } else {
    overallLevel = 'cant_verify';
    overallTitle = loc((a) => a.unifiedCantVerifyTitle);
    overallSummary = loc((a) => a.unifiedCantVerifySummary);
  }

  const amount = parseAmountInr(input.requestedAmountInr);
  const amountText = amount ? formatInr(amount) : '';

  if (
    msgPillar.status === 'high_risk' &&
    payPillar.status === 'high_risk' &&
    (sebiPillar.status === 'cant_verify' || sebiPillar.status === 'high_risk' || sebiPillar.status === 'caution')
  ) {
    connectionInsight = loc((a) => a.insightPitchPay(amountText));
  } else if (
    msgPillar.status === 'high_risk' &&
    payPillar.status === 'cant_verify' &&
    payPillar.extractedDetail
  ) {
    connectionInsight = loc((a) => a.insightPitchUnverifiedPay(amountText));
  } else if (
    linkPillar.status === 'high_risk' &&
    (msgPillar.status !== 'not_provided' || payPillar.status !== 'not_provided')
  ) {
    connectionInsight = loc((a) => a.insightLink);
  } else if (sebiPillar.extractedDetail && payPillar.status === 'high_risk') {
    const sebiId = sebiPillar.extractedDetail;
    connectionInsight = loc((a) => a.insightSebiPay(sebiId, amountText));
  } else if (highCount > 0 || cautionCount > 0) {
    connectionInsight = loc((a) => a.insightGeneralGap);
  } else {
    connectionInsight = loc((a) => a.insightUnconfirmed);
  }

  const stepCount = TRANSLATIONS.en.analyzer.unifiedNextSteps.length;
  const nextSteps: LocalizedText[] = Array.from({ length: stepCount }, (_, idx) =>
    loc((a) => a.unifiedNextSteps[idx])
  );

  return {
    overallLevel,
    overallTitle,
    overallSummary,
    connectionInsight,
    pillars,
    nextSteps,
    detectedSignalsCount: highCount + cautionCount,
    demoLimitNote: loc((a) => a.unifiedDemoLimit),
  };
}

export function analyzePaymentCheck(input: PaymentCheckInput): PaymentCheckResult {
  const handle = input.handleOrAccount.trim();
  const amount = parseAmountInr(input.amountInr);
  const hasAny = Boolean(handle || amount || input.claimedEntity.trim());

  if (!hasAny) {
    return {
      overallLevel: 'insufficient_data',
      overallTitle: loc((a) => a.payCheckEmptyTitle),
      overallSummary: loc((a) => a.payCheckEmptySummary),
      findings: [],
      checklist: [],
      demoLimitNote: loc((a) => a.payCheckEmptyDemo),
    };
  }

  const findings: PaymentFindingItem[] = [];
  let highCount = 0;
  let cautionCount = 0;

  // 1. Recipient name match
  if (input.recipientMatch === 'different') {
    highCount += 1;
    findings.push({
      id: 'name-mismatch',
      status: 'high_risk',
      statusLabel: loc((a) => a.payHighLabel),
      checkBasis: 'pattern_clues',
      title: loc((a) => a.payFindingNameDiffTitle),
      detail: loc((a) => a.payFindingNameDiffDesc),
    });
  } else if (input.recipientMatch === 'unsure') {
    findings.push({
      id: 'name-unsure',
      status: 'cant_verify',
      statusLabel: loc((a) => a.payCantVerifyLabel),
      checkBasis: 'unverified_live',
      title: loc((a) => a.payFindingNameUnsureTitle),
      detail: loc((a) => a.payFindingNameUnsureDesc),
    });
  }

  // 2. Method & handle check
  if (input.method === 'upi' && handle) {
    const upiMatch = handle.match(UPI_REGEX)?.[0];
    const suffix = upiMatch ? upiMatch.split('@')[1]?.toLowerCase() ?? '' : '';
    if (suffix && isValidSeBiUpiSuffix(suffix)) {
      findings.push({
        id: 'valid-upi-unverified',
        status: 'cant_verify',
        statusLabel: loc((a) => a.payValidUpiLabel),
        checkBasis: 'format_only',
        title: loc((a) => a.payFindingValidUpiTitle),
        detail: loc((a) => a.payFindingValidUpiDesc),
        evidencePhrase: sanitizeExtractedDetail(upiMatch || handle),
      });
    } else if (upiMatch && suffix) {
      findings.push({
        id: 'non-valid-upi',
        status: 'cant_verify',
        statusLabel: loc((a) => a.payCantVerifyLabel),
        checkBasis: 'unverified_live',
        title: loc((a) => a.payFindingNonValidUpiTitle(suffix)),
        detail: loc((a) => a.payFindingNonValidUpiDesc),
        evidencePhrase: sanitizeExtractedDetail(upiMatch),
      });
    } else if (!upiMatch) {
      cautionCount += 1;
      findings.push({
        id: 'upi-format',
        status: 'caution',
        statusLabel: loc((a) => a.payCautionLabel),
        checkBasis: 'format_only',
        title: loc((a) => a.payFindingUpiFormatTitle),
        detail: loc((a) => a.payFindingUpiFormatDesc),
        evidencePhrase: sanitizeExtractedDetail(handle),
      });
    }
  } else if (input.method === 'qr_or_link') {
    cautionCount += 1;
    findings.push({
      id: 'qr-link',
      status: 'caution',
      statusLabel: loc((a) => a.payCautionLabel),
      checkBasis: 'pattern_clues',
      title: loc((a) => a.payFindingQrTitle),
      detail: loc((a) => a.payFindingQrDesc),
      evidencePhrase: sanitizeExtractedDetail(handle),
    });
  } else if (input.method === 'bank_transfer' && input.source !== 'other') {
    cautionCount += 1;
    findings.push({
      id: 'bank-transfer-caution',
      status: 'caution',
      statusLabel: loc((a) => a.payCautionLabel),
      checkBasis: 'pattern_clues',
      title: loc((a) => a.payFindingBankTitle),
      detail: loc((a) => a.payFindingBankDesc),
      evidencePhrase: sanitizeExtractedDetail(handle),
    });
  }

  // 3. Source check
  if (input.source === 'whatsapp_telegram') {
    highCount += 1;
    findings.push({
      id: 'chat-source',
      status: 'high_risk',
      statusLabel: loc((a) => a.payHighLabel),
      checkBasis: 'pattern_clues',
      title: loc((a) => a.payFindingSourceTitle),
      detail: loc((a) => a.payFindingSourceDesc),
    });
  }

  // 4. Amount context (amount alone never establishes warning or safety; only adds supporting context when independent warnings exist)
  if (amount) {
    const formatted = formatInr(amount);
    const hasIndependentWarnings = highCount > 0 || cautionCount > 0;
    findings.push({
      id: 'amount-context',
      status: 'cant_verify',
      statusLabel: loc((a) => a.payCantVerifyLabel),
      checkBasis: hasIndependentWarnings ? 'pattern_clues' : 'unverified_live',
      title: loc((a) =>
        hasIndependentWarnings
          ? a.payFindingAmountContextTitle(formatted)
          : a.payFindingAmountTitle(formatted)
      ),
      detail: loc((a) =>
        hasIndependentWarnings ? a.payFindingAmountContextDesc : a.payFindingAmountDesc
      ),
      evidencePhrase: formatted,
    });
  }

  // Always add honest Demo-only verification limitation
  findings.push({
    id: 'cant-verify-live',
    status: 'cant_verify',
    statusLabel: loc((a) => a.payCantVerifyLabel),
    checkBasis: 'unverified_live',
    title: loc((a) => a.payFindingLiveTitle),
    detail: loc((a) => a.payFindingLiveDesc),
  });

  let overallLevel: RiskLevel = 'cant_verify';
  let overallTitle: LocalizedText;
  let overallSummary: LocalizedText;

  if (highCount > 0) {
    overallLevel = 'high_risk';
    overallTitle = loc((a) => a.payCheckHighTitle);
    overallSummary = loc((a) => a.payCheckHighSummary);
  } else if (cautionCount > 0) {
    overallLevel = 'caution';
    overallTitle = loc((a) => a.payCheckCautionTitle);
    overallSummary = loc((a) => a.payCheckCautionSummary);
  } else {
    overallLevel = 'cant_verify';
    overallTitle = loc((a) => a.payCheckCantVerifyTitle);
    overallSummary = loc((a) => a.payCheckCantVerifySummary);
  }

  const checklistLen = TRANSLATIONS.en.analyzer.payCheckChecklist.length;
  const checklist: LocalizedText[] = Array.from({ length: checklistLen }, (_, idx) =>
    loc((a) => a.payCheckChecklist[idx])
  );

  return {
    overallLevel,
    overallTitle,
    overallSummary,
    findings,
    checklist,
    demoLimitNote: loc((a) => a.payCheckDemoLimit),
  };
}

export function getCheckBasisLabel(
  basis: PillarFinding['checkBasis'],
  copy: TranslationBundle
): string | undefined {
  switch (basis) {
    case 'pattern_clues':
      return copy.checkBasis.patternClues;
    case 'format_only':
      return copy.checkBasis.formatOnly;
    case 'unverified_live':
      return copy.checkBasis.unverifiedLive;
    case 'not_provided':
      return copy.checkBasis.notProvided;
    default:
      return undefined;
  }
}

export function buildFamilySummaryText(
  result: UnifiedCheckResult,
  language: Language
): string {
  const copy = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const lines = [
    `${copy.brandName} — ${result.overallTitle[language]}`,
    '',
    `${copy.messageCheck.connectionHeading}: ${result.connectionInsight[language]}`,
    '',
    ...result.pillars.flatMap((p) => {
      const basisLabel = getCheckBasisLabel(p.checkBasis, copy);
      const basisText = basisLabel ? ` (${basisLabel})` : '';
      const base = `• ${copy.messageCheck.pillarTitles[p.id]} [${p.statusLabel[language]}]${basisText}: ${p.headline[language]}`;
      if (!p.warnings || p.warnings.length === 0) return [base];
      const warningLines = p.warnings.map(
        (w) => `  - “${redactGroupChatText(w.phrase)}”: ${w.explanation[language]}`
      );
      return [base, ...warningLines];
    }),
    '',
    `${copy.messageCheck.nextStepsHeading}:`,
    ...result.nextSteps.map((step, i) => `${i + 1}. ${step[language]}`),
    '',
    result.demoLimitNote[language],
  ];

  return redactGroupChatText(lines.join('\n'));
}
