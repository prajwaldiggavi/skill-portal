import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { TodayAttendanceScreen } from './src/screens/TodayAttendanceScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type ScreenName = 'dashboard' | 'scanner' | 'today' | 'history' | 'settings';

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00c2ff" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  switch (currentScreen) {
    case 'scanner':
      return <ScannerScreen onBack={() => setCurrentScreen('dashboard')} />;
    case 'today':
      return <TodayAttendanceScreen onBack={() => setCurrentScreen('dashboard')} />;
    case 'history':
      return <HistoryScreen onBack={() => setCurrentScreen('dashboard')} />;
    case 'settings':
      return <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />;
    case 'dashboard':
    default:
      return <DashboardScreen onNavigate={(screen) => setCurrentScreen(screen as ScreenName)} />;
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0c0e12" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0c0e12',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
