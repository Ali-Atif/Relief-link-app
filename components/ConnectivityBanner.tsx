import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../contexts/LanguageContext';
import { useNetInfoConnectivity } from '../hooks/useNetInfoConnectivity';
import { colors, radii, spacing } from '../utils/constants';

export function ConnectivityBanner() {
  const isOnline = useNetInfoConnectivity();
  const { t } = useLanguage();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, isOnline ? styles.online : styles.offline]}>
      <View style={styles.inner}>
        <Ionicons
          name={isOnline ? 'wifi' : 'cloud-offline'}
          size={18}
          color={isOnline ? colors.onlineText : colors.offlineText}
        />
        <Text style={[styles.label, isOnline ? styles.labelOnline : styles.labelOffline]} numberOfLines={1}>
          {isOnline ? t('connect.online') : t('connect.offline')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: 10,
    paddingHorizontal: spacing.md,
  },
  online: {
    backgroundColor: colors.onlineBg,
  },
  offline: {
    backgroundColor: colors.offlineBg,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  labelOnline: {
    color: colors.onlineText,
  },
  labelOffline: {
    color: colors.offlineText,
  },
});
