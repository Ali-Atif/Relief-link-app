/**
 * NGO report screen: form state, pending count, submit + sync (Firestore / AsyncStorage).
 * Alerts stay here because they need translated strings from `useLanguage`.
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useLanguage } from '../contexts/LanguageContext';
import {
  getIsOnline,
  getPendingNgoReportCount,
  submitNgoReport,
  syncPendingNgoReports,
} from '../services/ngoReportsService';

export function useNgoReportScreen() {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    setPendingCount(await getPendingNgoReportCount());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        await syncPendingNgoReports();
        if (!cancelled) {
          await refreshPending();
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [refreshPending]),
  );

  const clearForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setLocation('');
  }, []);

  const onSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const result = await submitNgoReport({ title, description, location });
      if (result.mode === 'submitted_online') {
        Alert.alert(t('report.sentTitle'), t('report.sentMsg'));
        clearForm();
      } else {
        Alert.alert(t('report.offlineTitle'), t('report.offlineMsg'));
        clearForm();
      }
      await refreshPending();
    } catch (e) {
      const message = e instanceof Error ? e.message : t('report.genericTry');
      Alert.alert(t('report.saveFailTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }, [title, description, location, t, clearForm, refreshPending]);

  const onSyncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const online = await getIsOnline();
      if (!online) {
        Alert.alert(t('report.offlineSyncTitle'), t('report.offlineSyncMsg'));
        return;
      }
      const { uploaded, failed } = await syncPendingNgoReports();
      await refreshPending();
      if (uploaded === 0 && failed === 0) {
        Alert.alert(t('report.upToDateTitle'), t('report.upToDateMsg'));
      } else if (failed === 0) {
        Alert.alert(t('report.syncDoneTitle'), t('report.syncDoneMsg', { count: uploaded }));
      } else {
        Alert.alert(
          t('report.partialTitle'),
          t('report.partialMsg', { ok: uploaded, fail: failed }),
        );
      }
    } catch {
      Alert.alert(t('report.syncErrTitle'), t('report.syncErrMsg'));
    } finally {
      setSyncing(false);
    }
  }, [t, refreshPending]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    location,
    setLocation,
    submitting,
    syncing,
    pendingCount,
    onSubmit,
    onSyncNow,
  };
}
