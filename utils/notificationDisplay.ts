import type { AppNotification } from '../services/notificationsService';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

/** Map stored English notification copy to localized strings (Firestore keeps canonical English). */
export function displayNotificationTitle(title: string, t: TFn): string {
  switch (title.trim()) {
    case 'NGO started chat':
      return t('notifications.preset.titleNgoStartedChat');
    case 'New chat message':
      return t('notifications.preset.titleNewChat');
    case 'New SOS application':
      return t('notifications.preset.titleNewSos');
    default:
      return title;
  }
}

export function displayNotificationBody(body: string, t: TFn): string {
  const b = body.trim();

  const ngoHelp = b.match(/^(.+?) started helping you in chat\.$/);
  if (ngoHelp) {
    return t('notifications.preset.bodyNgoStartedChat', { name: ngoHelp[1] });
  }

  const parts = b.split(' · ').map((p) => p.trim());
  if (parts.length >= 3 && /^Email:/i.test(parts[1]) && /^Phone:/i.test(parts[2])) {
    const name = parts[0];
    const email = parts[1].replace(/^Email:\s*/i, '').trim();
    const phone = parts[2].replace(/^Phone:\s*/i, '').trim();
    return t('notifications.preset.bodyNewSos', { name, email, phone });
  }

  const colon = b.indexOf(': ');
  if (colon > 0 && colon < b.length - 2) {
    const sender = b.slice(0, colon);
    const message = b.slice(colon + 2);
    if (!sender.includes('Email') && !sender.includes('Phone')) {
      return t('notifications.preset.bodyChatMessage', { sender, message });
    }
  }

  return body;
}

export function localizedNotification(item: AppNotification, t: TFn): { title: string; body: string } {
  return {
    title: displayNotificationTitle(item.title, t),
    body: displayNotificationBody(item.body, t),
  };
}
