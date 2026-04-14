import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import type { AuthStackParamList } from '../navigation/types';
import { colors } from '../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useLanguage();

  return (
    <ScreenLayout title={t('auth.registerScreenTitle')} subtitle={t('auth.registerOptionsSubtitle')}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('auth.registerAs')}</Text>
        <PrimaryButton
          label={t('auth.registerAsUser')}
          icon="person-outline"
          onPress={() => navigation.navigate('RegisterUser')}
        />
        <PrimaryButton
          label={t('auth.registerAsNgo')}
          icon="medkit-outline"
          onPress={() => navigation.navigate('RegisterNgo')}
        />
      </View>

      <PrimaryButton
        label={t('auth.backToSignIn')}
        variant="outline"
        icon="arrow-back-outline"
        onPress={() => navigation.navigate('Login')}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
