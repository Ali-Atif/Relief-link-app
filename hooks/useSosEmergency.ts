import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { runSosEmergency } from '../services/sosService';

/**
 * Wraps `runSosEmergency` with loading state and user-friendly alerts (translated).
 */
export function useSosEmergency() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sosLoading, setSosLoading] = useState(false);

  const triggerSos = useCallback(async () => {
    setSosLoading(true);
    try {
      const result = await runSosEmergency();

      if (result.ok) {
        const ngoLine =
          result.notifiedNgoCount > 0
            ? `\n\n${t('sos.successNgoLine', { count: result.notifiedNgoCount })}`
            : '';
        Alert.alert(
          t('sos.alertSuccessTitle'),
          `${t('sos.alertSuccessMsg', { count: result.recipientCount, url: result.mapsUrl })}${ngoLine}`,
        );
        return;
      }

      switch (result.reason) {
        case 'no_contacts': {
          const ngoExtra =
            (result.notifiedNgoCount ?? 0) > 0
              ? `\n\n${t('sos.noContactsNgoNotifiedLine', { count: result.notifiedNgoCount ?? 0 })}`
              : `\n\n${user ? t('sos.noContactsNgoZeroLine') : t('sos.noContactsGuestNgoLine')}`;
          Alert.alert(t('sos.noContactsTitle'), `${t('sos.noContactsMsg')}${ngoExtra}`, [
            { text: t('sos.noContactsNotNow'), style: 'cancel' },
            {
              text: t('sos.addEmergencyContact'),
              onPress: () => navigation.navigate('AddContact'),
            },
          ]);
          break;
        }
        case 'permission_denied':
          Alert.alert(t('sos.permissionTitle'), t('sos.permissionMsg'));
          break;
        case 'location_unavailable':
          Alert.alert(t('sos.locationFailTitle'), t('sos.locationFailMsg'));
          break;
        case 'sms_not_supported':
          if (result.mapsUrl != null && result.mapsUrl.length > 0) {
            Alert.alert(t('sos.smsNoTitle'), t('sos.smsNoMsgWithLink', { url: result.mapsUrl }));
          } else {
            Alert.alert(t('sos.smsNoTitle'), t('sos.smsNoMsg'));
          }
          break;
        case 'sms_cancelled':
          Alert.alert(t('sos.cancelTitle'), t('sos.cancelMsg'));
          break;
        default:
          Alert.alert(t('sos.genericTitle'), t('sos.genericMsg'));
      }
    } catch {
      Alert.alert(t('sos.genericTitle'), t('sos.genericMsg'));
    } finally {
      setSosLoading(false);
    }
  }, [navigation, t, user]);

  return { sosLoading, triggerSos };
}
