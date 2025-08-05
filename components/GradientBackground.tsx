import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
}

export default function GradientBackground({ 
  children, 
  colors = ['#10B981', '#059669', '#047857'] 
}: GradientBackgroundProps) {
  return (
    <LinearGradient 
      colors={colors} 
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});