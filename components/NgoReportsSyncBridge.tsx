import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { syncPendingNgoReports } from '../services/ngoReportsService';
import { isNetStateOnline } from '../utils/netInfoOnline';

/**
 * When a user is signed in, periodically attempts to upload pending NGO reports
 * (saved offline) after network recovery or when the app becomes active.
 */
export function NgoReportsSyncBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (user == null) {
      return;
    }

    let active = true;

    const runSync = () => {
      if (active) {
        void syncPendingNgoReports();
      }
    };

    runSync();

    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        runSync();
      }
    });

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (isNetStateOnline(state)) {
        runSync();
      }
    });

    return () => {
      active = false;
      appSub.remove();
      unsubscribeNet();
    };
  }, [user]);

  return null;
}
