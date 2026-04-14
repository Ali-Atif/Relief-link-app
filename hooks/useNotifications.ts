import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { markNotificationRead, subscribeNotifications, type AppNotification } from '../services/notificationsService';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    return subscribeNotifications(user.uid, setNotifications);
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllRead = async () => {
    const unread = notifications.filter((item) => !item.read);
    await Promise.all(unread.map((item) => markNotificationRead(item.id)));
  };

  return { notifications, unreadCount, markAllRead };
}
