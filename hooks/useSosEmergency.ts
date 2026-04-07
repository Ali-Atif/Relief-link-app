import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useLanguage } from '../contexts/LanguageContext';
import { runSosEmergency } from '../services/sosService';

/**
 * Wraps `runSosEmergency` with loading state and user-friendly alerts (translated).
 */
export function useSosEmergency() {
  const { t } = useLanguage();
  const [sosLoading, setSosLoading] = useState(false);

  const triggerSos = useCallback(async () => {
    setSosLoading(true);
    try {
      const result = await runSosEmergency();

      if (result.ok) {
        Alert.alert(
          t('sos.alertSuccessTitle'),
          t('sos.alertSuccessMsg', { count: result.recipientCount, url: result.mapsUrl }),
        );
        return;
      }

      switch (result.reason) {
        case 'no_contacts':
          Alert.alert(t('sos.noContactsTitle'), t('sos.noContactsMsg'));
          break;
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
  }, [t]);

  return { sosLoading, triggerSos };
}
