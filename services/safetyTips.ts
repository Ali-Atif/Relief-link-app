import type { AppLanguage } from '../i18n/types';

const TIPS: Record<AppLanguage, string[]> = {
  en: [
    'Keep a grab-bag ready with water, flashlight, medicines, and ID copies.',
    'Save emergency phone numbers in your contacts and on a paper card.',
    'During an earthquake, Drop, Cover, and Hold On until shaking stops.',
    'For flood alerts, move to higher ground and avoid walking in moving water.',
    'Keep your phone battery above 50% when severe weather is forecast.',
    'Practice your family emergency evacuation route every month.',
  ],
  ur: [
    'ایمرجنسی بیگ تیار رکھیں: پانی، ٹارچ، دوائیاں اور شناختی دستاویزات۔',
    'ایمرجنسی نمبرز فون اور کاغذ دونوں پر محفوظ رکھیں۔',
    'زلزلے میں جھکیں، ڈھانپیں اور مضبوطی سے تھامے رکھیں۔',
    'سیلاب میں اونچی جگہ پر جائیں اور بہتے پانی میں نہ چلیں۔',
    'شدید موسم کی پیشگوئی پر فون بیٹری 50% سے اوپر رکھیں۔',
    'خاندانی انخلا پلان کی ماہانہ مشق کریں۔',
  ],
};

export function getDailySafetyTip(language: AppLanguage, now = new Date()): string {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayOfYear = Math.floor((today - start) / 86400000);
  const tips = TIPS[language];
  return tips[dayOfYear % tips.length];
}
