import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { WalletProvider } from '@/components/WalletConnectProvider';
import { authService } from '@/services/authService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        await authService.init();
        setIsAuthenticated(authService.isAuthenticated());
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    }

    if (fontsLoaded || fontError) {
      checkAuth();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <WalletProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Main app screens
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          // Auth screens
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </WalletProvider>
  );
}