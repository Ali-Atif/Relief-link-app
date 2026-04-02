import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddContactScreen } from '../screens/AddContactScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { GuideDetailScreen } from '../screens/GuideDetailScreen';
import { GuidesScreen } from '../screens/GuidesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SOSScreen } from '../screens/SOSScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#f0fdfa' },
        headerTintColor: '#0f766e',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ReliefLink', headerBackVisible: false }} />
      <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Trusted contacts' }} />
      <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: 'Add contact' }} />
      <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report incident' }} />
      <Stack.Screen name="Guides" component={GuidesScreen} options={{ title: 'Safety guides' }} />
      <Stack.Screen name="GuideDetail" component={GuideDetailScreen} options={{ title: 'Guide' }} />
    </Stack.Navigator>
  );
}
