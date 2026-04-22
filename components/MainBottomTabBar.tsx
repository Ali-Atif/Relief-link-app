import { Ionicons } from '@expo/vector-icons';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../utils/constants';
import { flexRowWithDirection } from '../utils/layoutRtl';
import { getActiveRouteName } from '../navigation/getActiveRouteName';
import { dispatchResetToHome } from '../navigation/resetToHome';

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  routeName?: string;
};

type TabDef = {
  tabKey: string;
  screen: keyof RootStackParamList;
  labelKey: string;
  iconOn: keyof typeof Ionicons.glyphMap;
  iconOff: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDef[] = [
  { tabKey: 'Home', screen: 'Home', labelKey: 'home.tabHome', iconOn: 'home', iconOff: 'home-outline' },
  { tabKey: 'Guides', screen: 'Guides', labelKey: 'home.tabGuides', iconOn: 'book', iconOff: 'book-outline' },
  {
    tabKey: 'Report',
    screen: 'Report',
    labelKey: 'home.tabReports',
    iconOn: 'medkit',
    iconOff: 'medkit-outline',
  },
  {
    tabKey: 'SOS',
    screen: 'SOS',
    labelKey: 'home.tabSOS',
    iconOn: 'alert-circle',
    iconOff: 'alert-circle-outline',
  },
  {
    tabKey: 'Contacts',
    screen: 'Contacts',
    labelKey: 'home.tabChecklist',
    iconOn: 'checkbox',
    iconOff: 'checkbox-outline',
  },
  { tabKey: 'Quiz', screen: 'Quiz', labelKey: 'home.tabQuiz', iconOn: 'school', iconOff: 'school-outline' },
];

export function mapStackRouteToTabKey(route: string | undefined): string {
  if (!route) return 'Home';
  switch (route) {
    case 'Guides':
    case 'GuideDetail':
      return 'Guides';
    case 'Contacts':
    case 'AddContact':
      return 'Contacts';
    case 'SosHistory':
    case 'Notifications':
    case 'Chat':
      return 'Home';
    case 'Home':
    case 'Profile':
    case 'SOS':
    case 'Report':
    case 'Quiz':
      return route;
    default:
      return 'Home';
  }
}

export function MainBottomTabBar({ navigationRef, routeName }: Props) {
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const direction = language === 'ur' ? 'rtl' : 'ltr';

  const resolvedName =
    routeName ??
    (navigationRef.isReady() ? getActiveRouteName(navigationRef.getRootState()) : undefined) ??
    'Home';
  const activeTabKey = mapStackRouteToTabKey(resolvedName);

  const go = (screen: keyof RootStackParamList) => {
    if (!navigationRef.isReady()) return;
    if (screen === 'Home') {
      dispatchResetToHome(navigationRef.dispatch);
      return;
    }
    navigationRef.navigate(screen as never);
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm,
        },
      ]}
    >
      <View style={[styles.row, flexRowWithDirection(direction)]}>
        {TABS.map((tab) => {
          const active = activeTabKey === tab.tabKey;
          const icon = active ? tab.iconOn : tab.iconOff;
          return (
            <Pressable
              key={tab.tabKey}
              onPress={() => go(tab.screen)}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.tabItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(tab.labelKey)}
            >
              {active ? <View style={styles.topIndicator} /> : <View style={styles.topIndicatorSpacer} />}
              <Ionicons
                name={icon}
                size={22}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                style={[styles.tabLabel, active && styles.tabLabelActive]}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
  },
  tabItemPressed: {
    opacity: 0.75,
  },
  topIndicatorSpacer: {
    height: 3,
    marginBottom: 4,
    alignSelf: 'center',
    width: '50%',
  },
  topIndicator: {
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
    alignSelf: 'center',
    width: '52%',
    maxWidth: 36,
    backgroundColor: colors.primary,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    width: '100%',
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
