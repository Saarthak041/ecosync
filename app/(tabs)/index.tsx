import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import StatsCard from '@/components/StatsCard';
import Card from '@/components/Card';
import WalletSetupHelper from '@/components/WalletSetupHelper';
import { Leaf, Car, Utensils, TrendingDown, Award, Plus } from 'lucide-react-native';
import { TripData, MealData } from '@/types/carbonData';
import { getTrips, getMeals } from '../../utils/storage';
import { calculateTotalEmissions, calculateSavings } from '../../utils/carbonCalculator';
import EmissionSummary from '@/components/EmissionSummary';

export default function Dashboard() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const tripsData = await getTrips();
      const mealsData = await getMeals();
      setTrips(tripsData);
      setMeals(mealsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data for today
  const filterTodayData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      tripDate.setHours(0, 0, 0, 0);
      return tripDate.getTime() === today.getTime();
    });
    
    const todayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    });
    
    return { todayTrips, todayMeals };
  };

  // Calculate today's emissions
  const calculateTodayEmissions = () => {
    const { todayTrips, todayMeals } = filterTodayData();
    
    const tripEmissions = todayTrips.map(trip => trip.carbonEmission);
    const mealEmissions = todayMeals.map(meal => meal.carbonEmission);
    
    return calculateTotalEmissions(tripEmissions, mealEmissions);
  };

  // Calculate yesterday's emissions for comparison
  const calculateYesterdayEmissions = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      tripDate.setHours(0, 0, 0, 0);
      return tripDate.getTime() === yesterday.getTime();
    });
    
    const yesterdayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === yesterday.getTime();
    });
    
    const tripEmissions = yesterdayTrips.map(trip => trip.carbonEmission);
    const mealEmissions = yesterdayMeals.map(meal => meal.carbonEmission);
    
    return calculateTotalEmissions(tripEmissions, mealEmissions);
  };

  const todayEmission = calculateTodayEmissions();
  const yesterdayEmission = calculateYesterdayEmissions();
  const emissionChange = yesterdayEmission > 0 
    ? ((todayEmission - yesterdayEmission) / yesterdayEmission) * 100 
    : 0;
  
  const savings = calculateSavings(yesterdayEmission - todayEmission);

  // Calculate transport and food breakdown
  const calculateTransportEmissions = () => {
    return trips
      .filter(trip => {
        const tripDate = new Date(trip.date);
        const today = new Date();
        const timeDiff = today.getTime() - tripDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return daysDiff < 7; // Last week
      })
      .reduce((sum, trip) => sum + trip.carbonEmission, 0);
  };

  const calculateFoodEmissions = () => {
    return meals
      .filter(meal => {
        const mealDate = new Date(meal.date);
        const today = new Date();
        const timeDiff = today.getTime() - mealDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return daysDiff < 7; // Last week
      })
      .reduce((sum, meal) => sum + meal.carbonEmission, 0);
  };

  const transportEmission = calculateTransportEmissions();
  const foodEmission = calculateFoodEmissions();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.userName}>Alex Johnson</Text>
            </View>
            <View style={styles.streakBadge}>
              <Award size={16} color="#ffffff" />
              <Text style={styles.streakText}>7 Day Streak</Text>
            </View>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'day' && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod('day')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'day' && styles.periodButtonTextActive
              ]}>
                Day
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'week' && styles.periodButtonTextActive
              ]}>
                Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'month' && styles.periodButtonTextActive
              ]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Emission Summary */}
          <EmissionSummary 
            trips={trips}
            meals={meals}
            period={selectedPeriod}
          />

          {/* Category Breakdown */}
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Breakdown by Category</Text>
            <View style={styles.categoryGrid}>
              <StatsCard
                title="Transport"
                value={transportEmission.toFixed(1)}
                unit="kg CO₂"
                icon={<Car size={20} color="#F97316" />}
                color="#F97316"
              />
              <StatsCard
                title="Food"
                value={foodEmission.toFixed(1)}
                unit="kg CO₂"
                icon={<Utensils size={20} color="#EF4444" />}
                color="#EF4444"
              />
            </View>

            {/* AI Recommendations */}
            <Card style={styles.recommendationCard}>
              <Text style={styles.cardTitle}>🌱 Today's Recommendation</Text>
              <Text style={styles.recommendationText}>
                Switch to public transport for your evening commute. This could save you 
                <Text style={styles.highlightText}> 2.3 kg CO₂</Text> and 
                <Text style={styles.highlightText}> ₹45</Text> today!
              </Text>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Plus size={20} color="#10B981" />
                  <Text style={styles.actionText}>Log Trip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Utensils size={20} color="#10B981" />
                  <Text style={styles.actionText}>Log Meal</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
          
          {/* Wallet Setup Helper - Temporary for Ethereum deployment */}
          <WalletSetupHelper />
          
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
  },
  periodButtonTextActive: {
    opacity: 1,
  },
  mainStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  contentContainer: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  categoryGrid: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  highlightText: {
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginTop: 8,
  },
});