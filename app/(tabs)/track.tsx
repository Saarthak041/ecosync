import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Car, Utensils, Plus, X, Calendar, TrendingDown } from 'lucide-react-native';
import { TripData, MealData } from '../../types/carbonData';
import { saveTrip, getTrips, saveMeal, getMeals, deleteTrip, deleteMeal } from '../../utils/storage';
import AddTripForm from '@/components/AddTripForm';
import AddMealForm from '@/components/AddMealForm';
import { formatEmission } from '../../utils/carbonCalculator';

export default function Track() {
  const [selectedCategory, setSelectedCategory] = useState<'transport' | 'food'>('transport');
  const [showAddModal, setShowAddModal] = useState(false);
  const [trips, setTrips] = useState<TripData[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAddTrip = async (trip: TripData) => {
    try {
      await saveTrip(trip);
      setTrips(prevTrips => [...prevTrips, trip]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleAddMeal = async (meal: MealData) => {
    try {
      await saveMeal(meal);
      setMeals(prevMeals => [...prevMeals, meal]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteTrip(id);
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMeal(id);
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTripItem = ({ item }: { item: TripData }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconContainer, { backgroundColor: '#F3F4F6' }]}>
        {item.type === 'car' && <Car size={20} color="#F97316" />}
        {item.type === 'bus' && <Car size={20} color="#3B82F6" />}
        {item.type === 'train' && <Car size={20} color="#10B981" />}
        {item.type === 'flight' && <Car size={20} color="#EF4444" />}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Trip
        </Text>
        <Text style={styles.activityDetails}>
          {item.distance} km • {formatEmission(item.carbonEmission)}
        </Text>
        <Text style={styles.activityTime}>{formatDate(item.date)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTrip(item.id)}
      >
        <X size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderMealItem = ({ item }: { item: MealData }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconContainer, { backgroundColor: '#F3F4F6' }]}>
        {item.type === 'vegetarian' && <Utensils size={20} color="#10B981" />}
        {item.type === 'non-vegetarian' && <Utensils size={20} color="#EF4444" />}
        {item.type === 'vegan' && <Utensils size={20} color="#059669" />}
        {item.type === 'dairy' && <Utensils size={20} color="#F59E0B" />}
        {item.type === 'processed' && <Utensils size={20} color="#8B5CF6" />}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Meal
        </Text>
        <Text style={styles.activityDetails}>
          {item.quantity} serving(s) • {formatEmission(item.carbonEmission)}
        </Text>
        <Text style={styles.activityTime}>{formatDate(item.date)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteMeal(item.id)}
      >
        <X size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Track Activities</Text>
          <Text style={styles.subtitle}>
            Log your daily activities to monitor your carbon footprint
          </Text>
        </View>

        {/* Category Selector */}
        <View style={styles.categorySelector}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'transport' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('transport')}
          >
            <Car size={20} color={selectedCategory === 'transport' ? '#ffffff' : '#6B7280'} />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'transport' && styles.categoryButtonTextActive
            ]}>
              Transport
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'food' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('food')}
          >
            <Utensils size={20} color={selectedCategory === 'food' ? '#ffffff' : '#6B7280'} />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'food' && styles.categoryButtonTextActive
            ]}>
              Food
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Activity Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            Add {selectedCategory === 'transport' ? 'Trip' : 'Meal'}
          </Text>
        </TouchableOpacity>

        {/* Recent Activities */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          
          {selectedCategory === 'transport' && (
            trips.length > 0 ? (
              <FlatList
                data={trips.sort((a, b) => b.date.getTime() - a.date.getTime())}
                renderItem={renderTripItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={40} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No trips logged yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap the "Add Trip" button to log your first trip
                </Text>
              </View>
            )
          )}
          
          {selectedCategory === 'food' && (
            meals.length > 0 ? (
              <FlatList
                data={meals.sort((a, b) => b.date.getTime() - a.date.getTime())}
                renderItem={renderMealItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Utensils size={40} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No meals logged yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap the "Add Meal" button to log your first meal
                </Text>
              </View>
            )
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipText}>
            Logging activities consistently helps our AI provide better personalized recommendations. 
            Try to log activities within 2 hours for the most accurate tracking.
          </Text>
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          {selectedCategory === 'transport' ? (
            <AddTripForm 
              onSave={handleAddTrip}
              onCancel={() => setShowAddModal(false)}
            />
          ) : (
            <AddMealForm
              onSave={handleAddMeal}
              onCancel={() => setShowAddModal(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 8,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recentSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});