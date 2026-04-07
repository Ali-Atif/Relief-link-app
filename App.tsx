import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConnectivityBanner } from './components/ConnectivityBanner';
import { NgoReportsSyncBridge } from './components/NgoReportsSyncBridge';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { RootNavigator } from './navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
        <View style={styles.root}>
          <ConnectivityBanner />
          <NgoReportsSyncBridge />
          <View style={styles.nav}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </View>
        </View>
        </AuthProvider>
      </LanguageProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    flex: 1,
  },
});
