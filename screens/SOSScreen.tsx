import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { ScreenLayout, SosButton } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import { useSosEmergency } from '../hooks/useSosEmergency';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'SOS'>;

export function SOSScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const { sosLoading, triggerSos } = useSosEmergency();

  useTranslatedHeader(navigation, 'nav.sos');

  return (
    <ScreenLayout title={t('nav.sos')} subtitle={t('sos.screenSubtitle')}>
      <SosButton
        onPress={triggerSos}
        loading={sosLoading}
        subtitle={t('sos.sosDetailsSubtitle')}
        emergencySubLabel={t('sos.buttonSub')}
        accessibilityLabel={t('sos.a11yLabel')}
      />
      <Text style={styles.steps}>{t('sos.steps')}</Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  steps: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.md,
  },
});
