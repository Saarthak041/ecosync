import { Platform } from 'react-native';

export interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  boxShadow?: string;
}

export const createShadow = (
  color: string = '#000',
  offset: { width: number; height: number } = { width: 0, height: 2 },
  opacity: number = 0.1,
  radius: number = 4,
  elevation: number = 3
): ShadowStyle => {
  if (Platform.OS === 'web') {
    // Convert React Native shadow props to CSS boxShadow for web
    const { width, height } = offset;
    return {
      boxShadow: `${width}px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }

  // Return React Native shadow props for mobile
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation, // Android
  };
};

// Common shadow presets
export const shadowPresets = {
  small: createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  medium: createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 3),
  large: createShadow('#000', { width: 0, height: 4 }, 0.15, 8, 5),
  subtle: createShadow('#000', { width: 0, height: 1 }, 0.05, 2, 1),
};
