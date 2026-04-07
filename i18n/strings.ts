import type { AppLanguage } from './types';

/**
 * All UI copy for English and Urdu. Use `t(key)` from `LanguageContext`.
 * Placeholders: `{name}`, `{count}`, `{url}`, `{current}`, `{total}`, `{percent}`, `{ok}`, `{fail}`, `{email}`, `{phone}`.
 */
export const STRINGS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'connect.online': 'Online',
    'connect.offline': 'Offline Mode',
    'nav.reliefLink': 'ReliefLink',
    'nav.home': 'Home',
    'nav.sos': 'Emergency SOS',
    'nav.contacts': 'Emergency contacts',
    'nav.addContact': 'Add contact',
    'nav.report': 'Report incident',
    'nav.quiz': 'Awareness quiz',
    'nav.guides': 'Safety guides',
    'nav.guide': 'Guide',
    'nav.register': 'Create account',
    'auth.loginSubtitle':
      'Sign in with email and password. Works online; session is remembered offline.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signIn': 'Sign in',
    'auth.signingIn': 'Signing in…',
    'auth.createAccountBtn': 'Create an account',
    'auth.registerSubtitle': 'Create an account. You need internet for this step.',
    'auth.registerScreenTitle': 'Register',
    'auth.confirmPassword': 'Confirm password',
    'auth.creating': 'Creating account…',
    'auth.createAccountSubmit': 'Create account',
    'auth.backToSignIn': 'Back to sign in',
    'auth.passwordMismatch': 'Passwords do not match.',
    'auth.passwordTooShort': 'Password must be at least 6 characters.',
    'auth.phEmail': 'you@example.com',
    'auth.phPassword': '••••••••',
    'auth.phNewPassword': 'At least 6 characters',
    'auth.phConfirm': 'Repeat password',
    'home.title': 'Home',
    'home.subtitle': 'Choose where to go next.',
    'home.signedInAs': 'Signed in as {email}',
    'home.signedInOffline': 'Signed in (offline profile)',
    'home.sosDetails': 'SOS details',
    'home.emergencyContacts': 'Emergency contacts',
    'home.reportIncident': 'Report incident',
    'home.safetyGuides': 'Safety guides',
    'home.awarenessQuiz': 'Awareness quiz',
    'home.hint':
      'After you log in once with internet, your session is stored. You can open the app offline and stay signed in until you sign out.',
    'home.signOut': 'Sign out',
    'home.signingOut': 'Signing out…',
    'home.language': 'Language',
    'home.tapToSwitch': 'Tap to switch',
    'home.quickActions': 'Quick actions',
    'sos.subtitleHint':
      'Uses saved contacts + your GPS. Works offline once contacts are stored.',
    'sos.buttonSub': 'Emergency alert',
    'sos.screenSubtitle': 'Sends your live location link by SMS to everyone in Emergency contacts.',
    'sos.sosDetailsSubtitle': 'Same action as the SOS button on Home.',
    'sos.steps':
      'Steps: (1) Load contacts from this device (offline). (2) Get GPS position. (3) Open SMS with your map link.',
    'sos.alertSuccessTitle': 'SMS ready',
    'sos.alertSuccessMsg':
      'Your emergency text is open for {count} number(s).\n\nLocation link:\n{url}\n\nFinish in your SMS app — tap Send if it asks.',
    'sos.noContactsTitle': 'Add a contact first',
    'sos.noContactsMsg':
      'SOS sends your location by text. You need at least one phone number saved.\n\nGo to Emergency contacts → Add contact, then try SOS again.',
    'sos.permissionTitle': 'Location is off',
    'sos.permissionMsg':
      'We need your location so helpers can find you on a map.\n\nAllow location when prompted, or enable it in Settings for this app. Then tap SOS again.',
    'sos.locationFailTitle': 'Can’t get your location',
    'sos.locationFailMsg':
      'GPS didn’t lock in time.\n\nMove near a window or go outside, wait a few seconds, then tap SOS again.',
    'sos.smsNoTitle': 'SMS not available here',
    'sos.smsNoMsg':
      'This device can’t open SMS (some tablets, emulators, or web).\n\nShare your location another way if you can.',
    'sos.smsNoMsgWithLink':
      'SMS can’t open on this device, but your location is ready:\n\n{url}\n\nCopy the link and send it by chat, email, or another app.',
    'sos.cancelTitle': 'Message not sent',
    'sos.cancelMsg':
      'You left the SMS screen before sending.\n\nTap SOS again when you’re ready.',
    'sos.genericTitle': 'SOS didn’t finish',
    'sos.genericMsg':
      'Wait a moment, then tap SOS again.\n\nIf it keeps failing, open Emergency contacts and call someone directly.',
    'sos.a11yLabel': 'Emergency SOS. Sends your location by SMS to saved contacts.',
    'quiz.introTitle': 'Disaster awareness quiz',
    'quiz.introSubtitle':
      'Multiple choice on flood, earthquake, and fire. Works fully offline. Tap Start when you are ready.',
    'quiz.start': 'Start quiz',
    'quiz.questionOf': 'Question {current} of {total}',
    'quiz.next': 'Next',
    'quiz.finish': 'See results',
    'quiz.resultsTitle': 'Your score',
    'quiz.scoreLine': 'You got {correct} out of {total} correct ({percent}%).',
    'quiz.retry': 'Try again',
    'quiz.backHome': 'Back to home',
    'quiz.pickAnswer': 'Choose an answer to continue.',
    'quiz.topicFlood': 'Flood',
    'quiz.topicEarthquake': 'Earthquake',
    'quiz.topicFire': 'Fire',
    'report.title': 'NGO report',
    'report.subtitle':
      'Report an incident for relief teams. Online reports go to the server; offline ones stay on this device.',
    'report.pendingLine':
      '{count} report(s) waiting to upload. They sync when you have internet.',
    'report.labelTitle': 'Title',
    'report.labelDesc': 'Description',
    'report.labelLocation': 'Location',
    'report.phTitle': 'Short headline',
    'report.phDesc': 'What happened? Who is affected?',
    'report.phLocation': 'Area, landmark, or address',
    'report.submit': 'Submit report',
    'report.saving': 'Saving…',
    'report.syncBtn': 'Sync pending now',
    'report.syncing': 'Syncing…',
    'report.sentTitle': 'Report sent',
    'report.sentMsg': 'Your report reached the server. Relief teams can use it.',
    'report.offlineTitle': 'Saved on this phone',
    'report.offlineMsg':
      'No internet right now. Your report is safe here and will send automatically when you’re back online.',
    'report.saveFailTitle': 'Couldn’t save',
    'report.genericTry': 'Check your entries and try again.',
    'report.offlineSyncTitle': 'Still offline',
    'report.offlineSyncMsg':
      'Connect to the internet first, then tap Sync pending again.',
    'report.upToDateTitle': 'Nothing waiting',
    'report.upToDateMsg': 'All reports are uploaded, or you’re still offline.',
    'report.syncDoneTitle': 'Upload complete',
    'report.syncDoneMsg': '{count} report(s) sent successfully.',
    'report.partialTitle': 'Some uploads failed',
    'report.partialMsg':
      '{ok} sent. {fail} still waiting — check internet or try again later.',
    'report.syncErrTitle': 'Sync didn’t finish',
    'report.syncErrMsg': 'Try again when you have a stable connection.',
    'contacts.title': 'Emergency contacts',
    'contacts.subtitle':
      'Stored on this device only. Used when you tap SOS. No internet required.',
    'contacts.empty': 'No contacts yet. Tap below to add name and phone for SOS messages.',
    'contacts.delete': 'Delete',
    'contacts.add': 'Add contact',
    'contacts.contactFallback': 'Contact',
    'contacts.removeTitle': 'Remove contact?',
    'contacts.removeMsg': '{name} ({phone}) will be removed from emergency SMS.',
    'contacts.cancel': 'Cancel',
    'contacts.deleteAction': 'Delete',
    'contacts.deleteErrTitle': 'Couldn’t remove contact',
    'contacts.deleteErrMsg': 'Something went wrong. Try again in a moment.',
    'guides.title': 'Survival guides',
    'guides.subtitle':
      'Short actions for emergencies. Works fully offline — no internet needed.',
    'guides.openHint': 'Open guide',
    'guides.notFound': 'This guide could not be found.',
    'addContact.subtitle':
      'Saved on this device — persists after restart, works offline.',
    'addContact.name': 'Name',
    'addContact.phone': 'Phone',
    'addContact.phName': 'e.g. Mom',
    'addContact.hint': 'Use your country code. At least 8 digits total.',
    'addContact.save': 'Save contact',
    'addContact.saving': 'Saving…',
    'addContact.nameReqTitle': 'Name missing',
    'addContact.nameReqMsg': 'Enter a short name (e.g. Mom) so you know who this is.',
    'addContact.saveFailTitle': 'Couldn’t save',
    'addContact.tryAgain': 'Check your connection and try again.',
    'phone.required': 'Phone number is required.',
    'phone.tooShort':
      'Enter at least 8 digits, including your country code (e.g. +1 555 123 4567).',
    'phone.tooLong': 'Phone number is too long (maximum 15 digits).',
  },
  ur: {
    'connect.online': 'آن لائن',
    'connect.offline': 'آف لائن موڈ',
    'nav.reliefLink': 'ریلیف لنک',
    'nav.home': 'ہوم',
    'nav.sos': 'ایمرجنسی ایس او ایس',
    'nav.contacts': 'ایمرجنسی رابطے',
    'nav.addContact': 'رابطہ شامل کریں',
    'nav.report': 'واقعے کی اطلاع',
    'nav.quiz': 'آگاہی کوئز',
    'nav.guides': 'حفاظتی رہنمائیاں',
    'nav.guide': 'رہنمائی',
    'nav.register': 'اکاؤنٹ بنائیں',
    'auth.loginSubtitle':
      'ای میل اور پاس ورڈ سے سائن ان کریں۔ آن لائن کام کرتا ہے؛ سیشن آف لائن یاد رکھا جاتا ہے۔',
    'auth.email': 'ای میل',
    'auth.password': 'پاس ورڈ',
    'auth.signIn': 'سائن ان',
    'auth.signingIn': 'سائن ان ہو رہا ہے…',
    'auth.createAccountBtn': 'نیا اکاؤنٹ بنائیں',
    'auth.registerSubtitle': 'نیا اکاؤنٹ بنائیں۔ اس مرحلے کے لیے انٹرنیٹ درکار ہے۔',
    'auth.registerScreenTitle': 'رجسٹر',
    'auth.confirmPassword': 'پاس ورڈ کی تصدیق',
    'auth.creating': 'اکاؤنٹ بن رہا ہے…',
    'auth.createAccountSubmit': 'اکاؤنٹ بنائیں',
    'auth.backToSignIn': 'واپس سائن ان',
    'auth.passwordMismatch': 'پاس ورڈ میل نہیں کھاتے۔',
    'auth.passwordTooShort': 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔',
    'auth.phEmail': 'you@example.com',
    'auth.phPassword': '••••••••',
    'auth.phNewPassword': 'کم از کم 6 حروف',
    'auth.phConfirm': 'پاس ورڈ دہرائیں',
    'home.title': 'ہوم',
    'home.subtitle': 'آگے جانے کے لیے منتخب کریں۔',
    'home.signedInAs': 'سائن ان: {email}',
    'home.signedInOffline': 'سائن ان (آف لائن پروفائل)',
    'home.sosDetails': 'ایس او ایس تفصیلات',
    'home.emergencyContacts': 'ایمرجنسی رابطے',
    'home.reportIncident': 'واقعے کی اطلاع',
    'home.safetyGuides': 'حفاظتی رہنمائیاں',
    'home.awarenessQuiz': 'آگاہی کوئز',
    'home.hint':
      'ایک بار انٹرنیٹ پر سائن ان کے بعد آپ کا سیشن محفوظ ہو جاتا ہے۔ آپ آف لائن ایپ کھول سکتے ہیں یہاں تک کہ آپ سائن آؤٹ نہ کریں۔',
    'home.signOut': 'سائن آؤٹ',
    'home.signingOut': 'سائن آؤٹ ہو رہا ہے…',
    'home.language': 'زبان',
    'home.tapToSwitch': 'تبدیل کرنے کے لیے تھپتھپائیں',
    'home.quickActions': 'فوری اقدامات',
    'sos.subtitleHint':
      'محفوظ رابطے اور GPS استعمال ہوتے ہیں۔ رابطے محفوظ ہونے کے بعد آف لائن بھی کام کرتا ہے۔',
    'sos.buttonSub': 'ایمرجنسی الرٹ',
    'sos.screenSubtitle':
      'ایمرجنسی رابطوں کو ایس ایم ایس کے ذریعے آپ کا مقام بھیجتا ہے۔',
    'sos.sosDetailsSubtitle': 'ہوم والے ایس او ایس بٹن جیسا ہی اقدام۔',
    'sos.steps':
      'مراحل: (۱) رابطے ڈیوائس سے لوڈ۔ (۲) GPS مقام۔ (۳) نقشے کا لنک کے ساتھ ایس ایم ایس۔',
    'sos.alertSuccessTitle': 'ایس ایم ایس تیار',
    'sos.alertSuccessMsg':
      'ایمرجنسی متن {count} نمبر(وں) کے لیے کھلا ہے۔\n\nمقام کا لنک:\n{url}\n\nایس ایم ایس ایپ میں بھیجنا مکمل کریں — ضرورت ہو تو Send دبائیں۔',
    'sos.noContactsTitle': 'پہلے رابطہ شامل کریں',
    'sos.noContactsMsg':
      'ایس او ایس آپ کا مقام متن سے بھیجتا ہے۔ کم از کم ایک نمبر محفوظ ہونا چاہیے۔\n\nایمرجنسی رابطے → رابطہ شامل کریں، پھر ایس او ایس دوبارہ۔',
    'sos.permissionTitle': 'مقام بند ہے',
    'sos.permissionMsg':
      'مددگاروں کو نقشے پر تلاش کرنے کے لیے آپ کا مقام چاہیے۔\n\nجب پوچھے تو اجازت دیں، یا سیٹنگز میں اس ایپ کے لیے مقام چالو کریں۔ پھر ایس او ایس دوبارہ۔',
    'sos.locationFailTitle': 'مقام نہیں ملا',
    'sos.locationFailMsg':
      'GPS وقت پر لاک نہیں ہوا۔\n\nکھڑکی کے پاس یا باہر جائیں، چند سیکنڈ انتظار کریں، پھر ایس او ایس دوبارہ۔',
    'sos.smsNoTitle': 'یہاں ایس ایم ایس نہیں',
    'sos.smsNoMsg':
      'یہ ڈیوائس ایس ایم ایس نہیں کھول سکتی (کچھ ٹیبلٹ، ایمولیٹر، ویب)۔\n\nممکن ہو تو مقام کسی اور طریقے سے بھیجیں۔',
    'sos.smsNoMsgWithLink':
      'ایس ایم ایس نہیں کھل سکا، مگر آپ کا مقام تیار ہے:\n\n{url}\n\nلنک کاپی کریں اور چیٹ، ای میل، یا دوسری ایپ سے بھیجیں۔',
    'sos.cancelTitle': 'پیغام نہیں گیا',
    'sos.cancelMsg':
      'آپ نے ایس ایم ایس بند کر دیا قبل از ارسال۔\n\nتیار ہوں تو ایس او ایس دوبارہ دبائیں۔',
    'sos.genericTitle': 'ایس او ایس مکمل نہیں',
    'sos.genericMsg':
      'ایک لمحہ انتظار، پھر ایس او ایس دوبارہ۔\n\nاگر مسئلہ رہے تو ایمرجنسی رابطوں سے براہ راست کال کریں۔',
    'sos.a11yLabel':
      'ایمرجنسی ایس او ایس۔ محفوظ رابطوں کو ایس ایم ایس سے مقام بھیجتا ہے۔',
    'quiz.introTitle': 'آفات سے آگاہی کوئز',
    'quiz.introSubtitle':
      'سیلاب، زلزلہ، اور آگ پر کثیر الانتخاب۔ مکمل آف لائن۔ تیار ہوں تو شروع کریں پر تھپتھپائیں۔',
    'quiz.start': 'کوئز شروع کریں',
    'quiz.questionOf': 'سوال {current} از {total}',
    'quiz.next': 'اگلا',
    'quiz.finish': 'نتیجہ دیکھیں',
    'quiz.resultsTitle': 'آپ کا اسکور',
    'quiz.scoreLine': 'آپ نے {total} میں سے {correct} درست ({percent}%)۔',
    'quiz.retry': 'دوبارہ کوشش',
    'quiz.backHome': 'ہوم پر واپس',
    'quiz.pickAnswer': 'آگے بڑھنے کے لیے ایک جواب منتخب کریں۔',
    'quiz.topicFlood': 'سیلاب',
    'quiz.topicEarthquake': 'زلزلہ',
    'quiz.topicFire': 'آگ',
    'report.title': 'این جی او رپورٹ',
    'report.subtitle':
      'ریلیف ٹیموں کے لیے واقعے کی اطلاع۔ آن لائن سرور پر؛ آف لائن اس ڈیوائس پر۔',
    'report.pendingLine':
      '{count} رپورٹ اپ لوڈ کے منتظر۔ انٹرنیٹ ملتے ہی سنک ہو گی۔',
    'report.labelTitle': 'عنوان',
    'report.labelDesc': 'تفصیل',
    'report.labelLocation': 'مقام',
    'report.phTitle': 'مختصر سرخی',
    'report.phDesc': 'کیا ہوا؟ کون متاثر؟',
    'report.phLocation': 'علاقہ، نشان، یا پتہ',
    'report.submit': 'رپورٹ بھیجیں',
    'report.saving': 'محفوظ ہو رہا ہے…',
    'report.syncBtn': 'ابھی سنک کریں',
    'report.syncing': 'سنک ہو رہا ہے…',
    'report.sentTitle': 'رپورٹ بھیج دی',
    'report.sentMsg': 'آپ کی رپورٹ سرور تک پہنچ گئی — ریلیف ٹیمیں استعمال کر سکتی ہیں۔',
    'report.offlineTitle': 'فون پر محفوظ',
    'report.offlineMsg':
      'ابھی انٹرنیٹ نہیں۔ رپورٹ یہاں محفوظ ہے اور آن لائن آتے ہی خود بھیج دی جائے گی۔',
    'report.saveFailTitle': 'محفوظ نہیں ہو سکا',
    'report.genericTry': 'ان پٹ چیک کریں اور دوبارہ کوشش کریں۔',
    'report.offlineSyncTitle': 'ابھی آف لائن',
    'report.offlineSyncMsg':
      'پہلے انٹرنیٹ سے جڑیں، پھر زیر التواء سنک دوبارہ دبائیں۔',
    'report.upToDateTitle': 'کچھ نہیں باقی',
    'report.upToDateMsg': 'سب اپ لوڈ ہو چکا، یا آپ ابھی آف لائن ہیں۔',
    'report.syncDoneTitle': 'اپ لوڈ مکمل',
    'report.syncDoneMsg': '{count} رپورٹ کامیابی سے اپ لوڈ ہو گئیں۔',
    'report.partialTitle': 'کچھ اپ لوڈ ناکام',
    'report.partialMsg':
      '{ok} بھیجیں۔ {fail} باقی — انٹرنیٹ چیک کریں یا بعد میں کوشش کریں۔',
    'report.syncErrTitle': 'سنک مکمل نہیں',
    'report.syncErrMsg': 'مستحکم کنکشن پر دوبارہ کوشش کریں۔',
    'contacts.title': 'ایمرجنسی رابطے',
    'contacts.subtitle':
      'صرف اس ڈیوائس پر۔ ایس او ایس پر استعمال۔ انٹرنیٹ نہیں چاہیے۔',
    'contacts.empty':
      'ابھی کوئی رابطہ نہیں۔ ایس او ایس کے لیے نام اور فون شامل کریں۔',
    'contacts.delete': 'حذف',
    'contacts.add': 'رابطہ شامل کریں',
    'contacts.contactFallback': 'رابطہ',
    'contacts.removeTitle': 'رابطہ ہٹائیں؟',
    'contacts.removeMsg': '{name} ({phone}) ایمرجنسی ایس ایم ایس سے ہٹ جائے گا۔',
    'contacts.cancel': 'منسوخ',
    'contacts.deleteAction': 'حذف',
    'contacts.deleteErrTitle': 'حذف نہیں ہو سکا',
    'contacts.deleteErrMsg': 'کچھ غلط ہوا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    'guides.title': 'بقا کی رہنمائیاں',
    'guides.subtitle':
      'ایمرجنسی کے مختصر اقدامات۔ مکمل آف لائن — انٹرنیٹ نہیں۔',
    'guides.openHint': 'رہنمائی کھولیں',
    'guides.notFound': 'یہ رہنمائی نہیں ملی۔',
    'addContact.subtitle':
      'اس ڈیوائس پر محفوظ — دوبارہ شروع کے بعد بھی، آف لائن کام کرتا ہے۔',
    'addContact.name': 'نام',
    'addContact.phone': 'فون',
    'addContact.phName': 'مثلاً ماں',
    'addContact.hint': 'ملک کا کوڈ استعمال کریں۔ کم از کم 8 ہندسے۔',
    'addContact.save': 'رابطہ محفوظ کریں',
    'addContact.saving': 'محفوظ ہو رہا ہے…',
    'addContact.nameReqTitle': 'نام نہیں',
    'addContact.nameReqMsg': 'مختصر نام لکھیں (مثلاً ماں) تاکہ پہچان سکیں۔',
    'addContact.saveFailTitle': 'محفوظ نہیں ہو سکا',
    'addContact.tryAgain': 'کنکشن چیک کریں اور دوبارہ کوشش کریں۔',
    'phone.required': 'فون نمبر ضروری ہے۔',
    'phone.tooShort':
      'کم از کم 8 ہندسے، ملک کا کوڈ سمیت (مثلاً +92 300 1234567)۔',
    'phone.tooLong': 'فون نمبر بہت لمبا ہے (زیادہ سے زیادہ 15 ہندسے)۔',
  },
};

function applyPlaceholders(template: string, vars?: Record<string, string | number>): string {
  if (!vars) {
    return template;
  }
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    const token = `{${key}}`;
    out = out.split(token).join(String(value));
  }
  return out;
}

export function translate(lang: AppLanguage, key: string, vars?: Record<string, string | number>): string {
  const table = STRINGS[lang];
  const raw = table[key] ?? STRINGS.en[key] ?? key;
  return applyPlaceholders(raw, vars);
}
