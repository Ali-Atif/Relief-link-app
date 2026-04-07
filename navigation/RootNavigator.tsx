import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { AddContactScreen } from '../screens/AddContactScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { GuideDetailScreen } from '../screens/GuideDetailScreen';
import { GuidesScreen } from '../screens/GuidesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SOSScreen } from '../screens/SOSScreen';
import { colors } from '../utils/constants';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.headerText },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user == null ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ReliefLink', headerBackVisible: false }} />
          <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
          <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Emergency contacts' }} />
          <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: 'Add contact' }} />
          <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report incident' }} />
          <Stack.Screen name="Guides" component={GuidesScreen} options={{ title: 'Safety guides' }} />
          <Stack.Screen name="GuideDetail" component={GuideDetailScreen} options={{ title: 'Guide' }} />
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Awareness quiz' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
