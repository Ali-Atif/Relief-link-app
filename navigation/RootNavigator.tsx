import {
  NavigationContainer,
  type NavigationState,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MainBottomTabBar } from '../components/MainBottomTabBar';
import { useAuth } from '../contexts/AuthContext';
import { AddContactScreen } from '../screens/AddContactScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { GuideDetailScreen } from '../screens/GuideDetailScreen';
import { GuidesScreen } from '../screens/GuidesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SOSScreen } from '../screens/SOSScreen';
import { colors } from '../utils/constants';
import { getActiveRouteName } from './getActiveRouteName';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initializing } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [activeRouteName, setActiveRouteName] = useState<string | undefined>(undefined);

  const syncRoute = useCallback(() => {
    if (!navigationRef.isReady()) return;
    setActiveRouteName(getActiveRouteName(navigationRef.getRootState()));
  }, [navigationRef]);

  const onStateChange = useCallback(
    (state: NavigationState | undefined) => {
      setActiveRouteName(getActiveRouteName(state));
    },
    [],
  );

  useEffect(() => {
    if (user && navigationRef.isReady()) {
      syncRoute();
    }
  }, [user, navigationRef, syncRoute]);

  if (initializing) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={syncRoute}
      onStateChange={onStateChange}
    >
      {user == null ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <View style={styles.mainShell}>
          <View style={styles.stackSlot}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="SOS" component={SOSScreen} />
              <Stack.Screen name="Contacts" component={ContactsScreen} />
              <Stack.Screen name="AddContact" component={AddContactScreen} />
              <Stack.Screen name="Report" component={ReportScreen} />
              <Stack.Screen name="Guides" component={GuidesScreen} />
              <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
            </Stack.Navigator>
          </View>
          <MainBottomTabBar navigationRef={navigationRef} routeName={activeRouteName} />
        </View>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  mainShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stackSlot: {
    flex: 1,
    minHeight: 0,
  },
});
