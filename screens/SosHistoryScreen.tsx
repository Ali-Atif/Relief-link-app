import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout, SosRequestCard } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { type SosAlert, subscribeUserSosAlerts } from '../services/sosAlertsService';
import { colors, spacing } from '../utils/constants';
import { blockDirection } from '../utils/layoutRtl';

type Props = NativeStackScreenProps<RootStackParamList, 'SosHistory'>;

export function SosHistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [rerequestingAlertId, setRerequestingAlertId] = useState<string | null>(null);

  const textAlign = language === 'ur' ? 'right' : 'left';
  const direction = language === 'ur' ? 'rtl' : 'ltr';
  const heroDirection = language === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeUserSosAlerts(user.uid, (rows) => {
      setAlerts(rows);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, [user]);

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  const renderItem: ListRenderItem<SosAlert> = useCallback(
    ({ item }) => (
      <SosRequestCard
        alert={item}
        currentUserId={user?.uid}
        t={t}
        textAlign={textAlign}
        direction={direction}
        language={language}
        navigation={navigation}
        variant="card"
        rerequestingAlertId={rerequestingAlertId}
        onRerequestState={setRerequestingAlertId}
      />
    ),
    [user?.uid, t, textAlign, direction, language, navigation, rerequestingAlertId],
  );

  const keyExtractor = useCallback((a: SosAlert) => a.id, []);

  return (
    <ScreenLayout
      title={t('home.sosHistoryTitle')}
      subtitle={t('home.sosHistorySubtitle')}
      showBack={{
        label: t('nav.backChip'),
        onPress: onBack,
        accessibilityLabel: t('nav.backA11y'),
      }}
      scrollable={false}
      bodyGap={0}
      heroDirection={heroDirection}
    >
      {loading && alerts.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
      <FlatList
        data={alerts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          blockDirection(heroDirection),
          alerts.length === 0 && !loading ? styles.listEmpty : null,
        ]}
        ListEmptyComponent={
          !loading ? (
            <Text style={[styles.emptyText, { textAlign }]}>{t('home.noSosApplications')}</Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    paddingVertical: spacing.xl,
  },
  loading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default SosHistoryScreen;
