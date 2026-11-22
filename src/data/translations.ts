import type { Language, LanguageOption, TranslationBundle } from '../types/check';
import { en } from './locales/en';
import { enEasy } from './locales/enEasy';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { ta } from './locales/ta';
import { bn } from './locales/bn';
import { te } from './locales/te';
import { kn } from './locales/kn';
import { ml } from './locales/ml';
import { gu } from './locales/gu';
import { pa } from './locales/pa';
import { es } from './locales/es';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', bcp47: 'en', nativeLabel: 'English', englishName: 'English' },
  { code: 'en-easy', bcp47: 'en', nativeLabel: 'Easy English', englishName: 'Easy English' },
  { code: 'hi', bcp47: 'hi', nativeLabel: 'हिन्दी', englishName: 'Hindi' },
  { code: 'mr', bcp47: 'mr', nativeLabel: 'मराठी', englishName: 'Marathi' },
  { code: 'ta', bcp47: 'ta', nativeLabel: 'தமிழ்', englishName: 'Tamil' },
  { code: 'bn', bcp47: 'bn', nativeLabel: 'বাংলা', englishName: 'Bengali' },
  { code: 'te', bcp47: 'te', nativeLabel: 'తెలుగు', englishName: 'Telugu' },
  { code: 'kn', bcp47: 'kn', nativeLabel: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'ml', bcp47: 'ml', nativeLabel: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'gu', bcp47: 'gu', nativeLabel: 'ગુજરાતી', englishName: 'Gujarati' },
  { code: 'pa', bcp47: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { code: 'es', bcp47: 'es', nativeLabel: 'Español', englishName: 'Spanish' },
];

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en,
  'en-easy': enEasy,
  hi,
  mr,
  ta,
  bn,
  te,
  kn,
  ml,
  gu,
  pa,
  es,
};

export function getCopy(lang: Language): TranslationBundle {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.en;
}

export function getBcp47(lang: Language): string {
  return LANGUAGE_OPTIONS.find((opt) => opt.code === lang)?.bcp47 ?? 'en';
}
