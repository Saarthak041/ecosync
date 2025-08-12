import React from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from './LoginScreen';
import { authService } from '@/services/authService';

export default function Login() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  return (
    <LoginScreen
      navigation={{ navigate: router.push, goBack: router.back }}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
