import {
  NavigationContainer,
  type NavigationState,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { MainBottomTabBar } from "../components/MainBottomTabBar";
import { useAuth } from "../contexts/AuthContext";
import { AddContactScreen } from "../screens/AddContactScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ContactsScreen } from "../screens/ContactsScreen";
import { GuideDetailScreen } from "../screens/GuideDetailScreen";
import { GuidesScreen } from "../screens/GuidesScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { NgoHomeScreen } from "../screens/NgoHomeScreen";
import { RegisterNgoScreen } from "../screens/RegisterNgoScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { RegisterUserScreen } from "../screens/RegisterUserScreen";
import { QuizScreen } from "../screens/QuizScreen";
import { ReportScreen } from "../screens/ReportScreen";
import { SosHistoryScreen } from "../screens/SosHistoryScreen";
import { SOSScreen } from "../screens/SOSScreen";
import { colors } from "../utils/constants";
import { getActiveRouteName } from "./getActiveRouteName";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initializing } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [activeRouteName, setActiveRouteName] = useState<string | undefined>(
    undefined,
  );

  const syncRoute = useCallback(() => {
    if (!navigationRef.isReady()) return;
    setActiveRouteName(getActiveRouteName(navigationRef.getRootState()));
  }, [navigationRef]);

  const onStateChange = useCallback((state: NavigationState | undefined) => {
    setActiveRouteName(getActiveRouteName(state));
  }, []);

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
      key={user?.role ?? 'guest'}
      ref={navigationRef}
      onReady={syncRoute}
      onStateChange={onStateChange}
    >
      {user == null ? (
        // 🔓 Auth Screens
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RegisterUser" component={RegisterUserScreen} />
          <Stack.Screen name="RegisterNgo" component={RegisterNgoScreen} />
        </Stack.Navigator>
      ) : (
        // 🔐 Main App with Bottom Tab + Role Logic
        <View style={styles.mainShell}>
          <View style={styles.stackSlot}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              {/* 👇 Role Based Home */}
              {user.role === "ngo" ? (
                <Stack.Screen name="NgoHome" component={NgoHomeScreen} />
              ) : (
                <Stack.Screen name="Home" component={HomeScreen} />
              )}

              {/* 👇 Common Screens */}
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="SOS" component={SOSScreen} />
              <Stack.Screen name="Contacts" component={ContactsScreen} />
              <Stack.Screen name="AddContact" component={AddContactScreen} />
              <Stack.Screen name="Report" component={ReportScreen} />
              <Stack.Screen name="Guides" component={GuidesScreen} />
              <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
              <Stack.Screen name="SosHistory" component={SosHistoryScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
          </View>

          {/* 👇 Bottom Tab Bar */}
          {user.role === 'user' ? (
            <MainBottomTabBar
              navigationRef={navigationRef}
              routeName={activeRouteName}
            />
          ) : null}
        </View>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
