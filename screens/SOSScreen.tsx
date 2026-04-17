import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ScreenLayout, SosButton } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSosEmergency } from '../hooks/useSosEmergency';
import { dispatchResetToHome } from '../navigation/resetToHome';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'SOS'>;

export function SOSScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { sosLoading, triggerSos } = useSosEmergency();
  const heroDirection = language === 'ur' ? 'rtl' : 'ltr';
  const textAlign = language === 'ur' ? 'right' : 'left';

  const onBack = useCallback(() => {
    dispatchResetToHome(navigation.dispatch, user?.role === 'ngo');
  }, [navigation, user?.role]);

  return (
    <ScreenLayout
      title={t('nav.sos')}
      subtitle={t('sos.screenSubtitle')}
      showBack={{
        label: t('guides.backToHome'),
        onPress: onBack,
        accessibilityLabel: t('guides.backToHome'),
      }}
      heroDirection={heroDirection}
    >
      <SosButton
        onPress={triggerSos}
        loading={sosLoading}
        mainLabel={t('sos.bigButtonLabel')}
        subtitle={t('sos.sosDetailsSubtitle')}
        subtitleStyle={{ textAlign }}
        emergencySubLabel={t('sos.buttonSub')}
        accessibilityLabel={t('sos.a11yLabel')}
      />
      <Text style={[styles.steps, { textAlign }]}>{t('sos.steps')}</Text>
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
