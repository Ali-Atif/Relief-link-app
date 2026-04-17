import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { t, language } = useLanguage();
  const heroDirection = language === 'ur' ? 'rtl' : 'ltr';

  const onBack = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <ScreenLayout
      title={t('auth.registerScreenTitle')}
      subtitle={t('auth.registerOptionsSubtitle')}
      heroDirection={heroDirection}
    >
      <View style={styles.card}>
        <PrimaryButton
          label={t('auth.registerAsNgo')}
          icon="business-outline"
          onPress={() => navigation.navigate('RegisterNgo')}
        />

        <PrimaryButton
          label={t('auth.registerAsUser')}
          icon="person-outline"
          onPress={() => navigation.navigate('RegisterUser')}
        />
        <PrimaryButton
          label={t('auth.backToSignIn')}
          icon="arrow-back-outline"
          variant="outline"
          onPress={onBack}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
