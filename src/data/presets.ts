import type {
  GroupChatPreset,
  Language,
  LocalizedText,
  MessageDemoPreset,
  PaymentDemoPreset,
} from '../types/check';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from './translations';

function buildMessagePresetTitle(id: string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = TRANSLATIONS[opt.code].presets.message[id]?.title ?? '';
    return acc;
  }, {} as Record<Language, string>);
}

function buildMessagePresetSubtitle(id: string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = TRANSLATIONS[opt.code].presets.message[id]?.subtitle ?? '';
    return acc;
  }, {} as Record<Language, string>);
}

function buildPaymentPresetTitle(id: string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = TRANSLATIONS[opt.code].presets.payment[id]?.title ?? '';
    return acc;
  }, {} as Record<Language, string>);
}

function buildPaymentPresetSubtitle(id: string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = TRANSLATIONS[opt.code].presets.payment[id]?.subtitle ?? '';
    return acc;
  }, {} as Record<Language, string>);
}

function buildGroupChatPresetTitle(id: string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = TRANSLATIONS[opt.code].groupChat.presets[id]?.title ?? '';
    return acc;
  }, {} as Record<Language, string>);
}

function buildGroupChatPresetSubtitle(id: string): LocalizedText {
  return LANGUAGE_OPTIONS.reduce((acc, opt) => {
    acc[opt.code] = TRANSLATIONS[opt.code].groupChat.presets[id]?.subtitle ?? '';
    return acc;
  }, {} as Record<Language, string>);
}

export const MESSAGE_DEMO_PRESETS: MessageDemoPreset[] = [
  {
    id: 'guaranteed-whatsapp',
    title: buildMessagePresetTitle('guaranteed-whatsapp'),
    subtitle: buildMessagePresetSubtitle('guaranteed-whatsapp'),
    input: {
      messageText:
        'VIP Institutional Desk: Earn 25% guaranteed monthly profit on upper-circuit stocks. Limited seats closing today only! Pay ₹25,000 registration fee now to unlock your allocation.',
      sebiClaim: 'INA000099999 (Demo sample)',
      websiteLink: 'https://angel-vip-trade.example.in/join',
      paymentDetail: 'wealth.desk88@okaxis',
      requestedAmountInr: '25000',
    },
  },
  {
    id: 'pre-ipo-apk',
    title: buildMessagePresetTitle('pre-ipo-apk'),
    subtitle: buildMessagePresetSubtitle('pre-ipo-apk'),
    input: {
      messageText:
        'Congratulations! Your allotment for the upcoming block deal is approved. Download our institutional trading app and transfer ₹50,000 within 30 minutes via IMPS to our agent account.',
      sebiClaim: '',
      websiteLink: 'https://ipo-allot-portal.example.in/tradesetup.apk',
      paymentDetail: 'IMPS to Agent Savings Account 400192837412',
      requestedAmountInr: '50000',
    },
  },
  {
    id: 'incomplete-advisory',
    title: buildMessagePresetTitle('incomplete-advisory'),
    subtitle: buildMessagePresetSubtitle('incomplete-advisory'),
    input: {
      messageText:
        'Namaste, please review our quarterly equity research note. Let us know if you would like to schedule an introductory call with our team.',
      sebiClaim: 'INH000012345',
      websiteLink: 'https://sample-research-advisory.example.in',
      paymentDetail: '',
      requestedAmountInr: '',
    },
  },
];

export const PAYMENT_DEMO_PRESETS: PaymentDemoPreset[] = [
  {
    id: 'pay-whatsapp-upi',
    title: buildPaymentPresetTitle('pay-whatsapp-upi'),
    subtitle: buildPaymentPresetSubtitle('pay-whatsapp-upi'),
    input: {
      method: 'upi',
      handleOrAccount: 'sample.broker92@ybl',
      ifscCode: '',
      amountInr: '25000',
      claimedEntity: 'Sample Institutional Wealth Desk',
      recipientMatch: 'different',
      source: 'whatsapp_telegram',
    },
  },
  {
    id: 'pay-qr-refund',
    title: buildPaymentPresetTitle('pay-qr-refund'),
    subtitle: buildPaymentPresetSubtitle('pay-qr-refund'),
    input: {
      method: 'qr_or_link',
      handleOrAccount: 'bit.ly/demo-pay-link',
      ifscCode: '',
      amountInr: '15000',
      claimedEntity: 'Demo Pro Trade App',
      recipientMatch: 'unsure',
      source: 'trading_app',
    },
  },
  {
    id: 'pay-bank-imps',
    title: buildPaymentPresetTitle('pay-bank-imps'),
    subtitle: buildPaymentPresetSubtitle('pay-bank-imps'),
    input: {
      method: 'bank_transfer',
      handleOrAccount: '91002233445566',
      ifscCode: 'DEMO0001234',
      amountInr: '100000',
      claimedEntity: 'Example Capital Partners',
      recipientMatch: 'unsure',
      source: 'adviser_claim',
    },
  },
];

export const GROUP_CHAT_PRESETS: GroupChatPreset[] = [
  {
    id: 'gc-multi-stage',
    isSuspiciousExample: true,
    title: buildGroupChatPresetTitle('gc-multi-stage'),
    subtitle: buildGroupChatPresetSubtitle('gc-multi-stage'),
    conversationText: [
      '[Day 1] Admin: Welcome to our VIP Institutional Desk for pre-IPO quota and 25% guaranteed monthly profit.',
      '[Day 2] Member 1: Thanks to Mentor, I booked ₹45,000 today! Look at this profit screenshot.',
      '[Day 3] Admin: Download our private trading app here: https://ipo-vip-desk.example.in/setup.apk and join our private Telegram channel.',
      '[Day 4] Admin: Limited seats closing today only! Pay ₹25,000 registration fee now via UPI wealth.desk88@okaxis.',
      '[Day 6] Support: Your withdrawal is frozen. Pay 20% tax first to release profit.',
    ].join('\n'),
  },
  {
    id: 'gc-protective-otp',
    isSuspiciousExample: false,
    title: buildGroupChatPresetTitle('gc-protective-otp'),
    subtitle: buildGroupChatPresetSubtitle('gc-protective-otp'),
    conversationText: [
      '[Day 1] Family Member: SEBI security alert: Never share your OTP, UPI PIN, ATM PIN, CVV, or password with anyone.',
      '[Day 1] Relative: Remember your bank sends a one-time OTP only for your own login, and UPI PIN only sends money out.',
      '[Day 2] Friend: Do not rush to pay anyone on chat. Market returns are never guaranteed.',
    ].join('\n'),
  },
  {
    id: 'gc-neutral-discuss',
    isSuspiciousExample: false,
    title: buildGroupChatPresetTitle('gc-neutral-discuss'),
    subtitle: buildGroupChatPresetSubtitle('gc-neutral-discuss'),
    conversationText: [
      'Speaker 1: I am reading about Nifty 50 index mutual funds for long-term saving.',
      'Speaker 2: Good idea to compare expense ratios and remember equity returns are not guaranteed.',
      'Speaker 1: Yes, I checked the broker on investor.sebi.gov.in and use my own official bank UPI app.',
    ].join('\n'),
  },
  {
    id: 'gc-mixed-chat',
    isSuspiciousExample: true,
    title: buildGroupChatPresetTitle('gc-mixed-chat'),
    subtitle: buildGroupChatPresetSubtitle('gc-mixed-chat'),
    conversationText: [
      'Member A: Please be careful — never share your OTP or UPI PIN with anyone in this group.',
      'Moderator: Do not worry, this is 100% safe! Join our WhatsApp group for 20% guaranteed monthly profit and pay ₹15,000 today only.',
    ].join('\n'),
  },
];
