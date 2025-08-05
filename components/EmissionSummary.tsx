import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TripData, MealData } from '../types/carbonData';
import { calculateTotalEmissions, calculateSavings, formatEmission } from '../utils/carbonCalculator';

interface EmissionSummaryProps {
  trips: TripData[];
  meals: MealData[];
  period: 'day' | 'week' | 'month';
}

const EmissionSummary: React.FC<EmissionSummaryProps> = ({ trips, meals, period }) => {
  // Filter data based on the selected period
  const filterByPeriod = (date: Date) => {
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    switch (period) {
      case 'day':
        return daysDiff < 1;
      case 'week':
        return daysDiff < 7;
      case 'month':
        return daysDiff < 30;
      default:
        return true;
    }
  };
  
  const filteredTrips = trips.filter(trip => filterByPeriod(trip.date));
  const filteredMeals = meals.filter(meal => filterByPeriod(meal.date));
  
  // Calculate emissions
  const tripEmissions = filteredTrips.map(trip => trip.carbonEmission);
  const mealEmissions = filteredMeals.map(meal => meal.carbonEmission);
  
  const totalEmission = calculateTotalEmissions(tripEmissions, mealEmissions);
  
  // Calculate previous period for comparison
  const getPreviousPeriodEmissions = () => {
    const previousPeriodStart = new Date();
    const previousPeriodEnd = new Date();
    
    switch (period) {
      case 'day':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 2);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        break;
      case 'week':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7);
        break;
      case 'month':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);
        break;
    }
    
    const previousTrips = trips.filter(trip => {
      const tripDate = trip.date;
      return tripDate >= previousPeriodStart && tripDate <= previousPeriodEnd;
    });
    
    const previousMeals = meals.filter(meal => {
      const mealDate = meal.date;
      return mealDate >= previousPeriodStart && mealDate <= previousPeriodEnd;
    });
    
    const prevTripEmissions = previousTrips.map(trip => trip.carbonEmission);
    const prevMealEmissions = previousMeals.map(meal => meal.carbonEmission);
    
    return calculateTotalEmissions(prevTripEmissions, prevMealEmissions);
  };
  
  const previousEmission = getPreviousPeriodEmissions();
  const emissionChange = previousEmission > 0 
    ? ((totalEmission - previousEmission) / previousEmission) * 100 
    : 0;
  
  // Calculate savings
  const savings = calculateSavings(previousEmission - totalEmission);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{period.charAt(0).toUpperCase() + period.slice(1)}'s Impact</Text>
      
      <View style={styles.emissionContainer}>
        <Text style={styles.emissionLabel}>Total CO₂ Emissions</Text>
        <Text style={styles.emissionValue}>{formatEmission(totalEmission)}</Text>
        
        <View style={styles.changeContainer}>
          <Text 
            style={[
              styles.changeText, 
              { color: emissionChange <= 0 ? '#10B981' : '#EF4444' }
            ]}
          >
            {emissionChange <= 0 ? '↓' : '↑'} {Math.abs(emissionChange).toFixed(1)}% from previous {period}
          </Text>
        </View>
      </View>
      
      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Transport</Text>
          <Text style={styles.breakdownValue}>
            {formatEmission(tripEmissions.reduce((sum, emission) => sum + emission, 0))}
          </Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Food</Text>
          <Text style={styles.breakdownValue}>
            {formatEmission(mealEmissions.reduce((sum, emission) => sum + emission, 0))}
          </Text>
        </View>
      </View>
      
      {emissionChange < 0 && (
        <View style={styles.savingsContainer}>
          <Text style={styles.savingsLabel}>Estimated Savings</Text>
          <Text style={styles.savingsValue}>₹{savings}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emissionContainer: {
    marginBottom: 16,
  },
  emissionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  emissionValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  changeContainer: {
    marginTop: 4,
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  savingsContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  savingsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 4,
  },
  savingsValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
});

export default EmissionSummary;