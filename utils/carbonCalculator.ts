import { CARBON_FACTORS } from '../types/carbonData';

// Calculate carbon emission for a trip
export const calculateTripEmission = (
  type: 'car' | 'bus' | 'train' | 'flight',
  distance: number,
  flightType?: 'short' | 'medium' | 'long'
): number => {
  if (type === 'flight' && flightType) {
    return CARBON_FACTORS.transport.flight[flightType] * distance;
  }
  
  return CARBON_FACTORS.transport[type] * distance;
};

// Calculate carbon emission for a meal
export const calculateMealEmission = (
  type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'dairy' | 'processed',
  quantity: number
): number => {
  return CARBON_FACTORS.food[type] * quantity;
};

// Determine flight type based on distance
export const determineFlightType = (distance: number): 'short' | 'medium' | 'long' => {
  if (distance < 1000) return 'short';
  if (distance < 3700) return 'medium';
  return 'long';
};

// Calculate total carbon emissions for a time period
export const calculateTotalEmissions = (
  tripEmissions: number[],
  mealEmissions: number[]
): number => {
  const totalTripEmissions = tripEmissions.reduce((sum, emission) => sum + emission, 0);
  const totalMealEmissions = mealEmissions.reduce((sum, emission) => sum + emission, 0);
  
  return totalTripEmissions + totalMealEmissions;
};

// Calculate savings in rupees based on carbon reduction
export const calculateSavings = (carbonReduction: number): number => {
  // Approximate conversion: 1 kg CO2 reduction ≈ ₹22 savings
  // This is based on average fuel costs and efficiency
  return Math.round(carbonReduction * 22);
};

// Format carbon emission for display
export const formatEmission = (emission: number): string => {
  if (emission < 1) {
    return `${(emission * 1000).toFixed(0)} g`;
  }
  return `${emission.toFixed(1)} kg`;
};