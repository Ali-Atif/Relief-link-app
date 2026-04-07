/**
 * NGO incident report form. Submit/sync logic is in `hooks/useNgoReportScreen` + `ngoReportsService`.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, ScreenLayout } from '../components';
import { useLanguage } from '../contexts/LanguageContext';
import { useNgoReportScreen } from '../hooks/useNgoReportScreen';
import { useTranslatedHeader } from '../hooks/useTranslatedHeader';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

export function ReportScreen({ navigation }: Props) {
  const { t } = useLanguage();
  useTranslatedHeader(navigation, 'nav.report');

  const {
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
  } = useNgoReportScreen();

  return (
    <ScreenLayout title={t('report.title')} subtitle={t('report.subtitle')}>
      {pendingCount > 0 ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t('report.pendingLine', { count: pendingCount })}</Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>{t('report.labelTitle')}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t('report.phTitle')}
          placeholderTextColor={colors.textMuted}
          editable={!submitting}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('report.labelDesc')}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('report.phDesc')}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          editable={!submitting}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('report.labelLocation')}</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder={t('report.phLocation')}
          placeholderTextColor={colors.textMuted}
          editable={!submitting}
        />
      </View>

      <PrimaryButton
        label={submitting ? t('report.saving') : t('report.submit')}
        icon="paper-plane-outline"
        onPress={() => void onSubmit()}
        disabled={submitting}
      />

      {submitting ? (
        <View style={styles.inlineSpinner}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      <PrimaryButton
        label={syncing ? t('report.syncing') : t('report.syncBtn')}
        icon="cloud-upload-outline"
        onPress={() => void onSyncNow()}
        disabled={syncing || pendingCount === 0}
      />

      {syncing ? (
        <View style={styles.inlineSpinner}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 10,
    padding: spacing.md,
  },
  bannerText: {
    fontSize: 15,
    color: '#9a3412',
    lineHeight: 22,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inlineSpinner: {
    alignItems: 'center',
    marginTop: -spacing.sm,
  },
});
