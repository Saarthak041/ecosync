import React from 'react';
import { useRouter } from 'expo-router';
import RegisterScreen from './RegisterScreen';
import { authService } from '@/services/authService';

export default function Register() {
  const router = useRouter();

  const handleRegisterSuccess = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  return (
    <RegisterScreen
      navigation={{ navigate: router.push, goBack: router.back }}
      onRegisterSuccess={handleRegisterSuccess}
    />
  );
}
