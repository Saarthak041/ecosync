import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { shadowPresets } from '../utils/shadowUtils';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    ...shadowPresets.medium,
  },
});