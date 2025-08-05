import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripData, MealData, Goal } from '../types/carbonData';

// Keys for AsyncStorage
const TRIPS_STORAGE_KEY = 'ecosync_trips';
const MEALS_STORAGE_KEY = 'ecosync_meals';
const GOALS_STORAGE_KEY = 'ecosync_goals';

// Trip data functions
export const saveTrip = async (trip: TripData): Promise<void> => {
  try {
    const existingTripsJSON = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    const existingTrips: TripData[] = existingTripsJSON ? JSON.parse(existingTripsJSON) : [];
    
    const updatedTrips = [...existingTrips, trip];
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
  } catch (error) {
    console.error('Error saving trip:', error);
    throw error;
  }
};

export const getTrips = async (): Promise<TripData[]> => {
  try {
    const tripsJSON = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    if (!tripsJSON) return [];
    
    const trips: TripData[] = JSON.parse(tripsJSON);
    return trips.map(trip => ({
      ...trip,
      date: new Date(trip.date)
    }));
  } catch (error) {
    console.error('Error getting trips:', error);
    return [];
  }
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    const tripsJSON = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    if (!tripsJSON) return;
    
    const trips: TripData[] = JSON.parse(tripsJSON);
    const updatedTrips = trips.filter(trip => trip.id !== tripId);
    
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Meal data functions
export const saveMeal = async (meal: MealData): Promise<void> => {
  try {
    const existingMealsJSON = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    const existingMeals: MealData[] = existingMealsJSON ? JSON.parse(existingMealsJSON) : [];
    
    const updatedMeals = [...existingMeals, meal];
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
};

export const getMeals = async (): Promise<MealData[]> => {
  try {
    const mealsJSON = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    if (!mealsJSON) return [];
    
    const meals: MealData[] = JSON.parse(mealsJSON);
    return meals.map(meal => ({
      ...meal,
      date: new Date(meal.date)
    }));
  } catch (error) {
    console.error('Error getting meals:', error);
    return [];
  }
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    const mealsJSON = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    if (!mealsJSON) return;
    
    const meals: MealData[] = JSON.parse(mealsJSON);
    const updatedMeals = meals.filter(meal => meal.id !== mealId);
    
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

// Goal functions
export const saveGoal = async (goal: Goal): Promise<void> => {
  try {
    const existingGoalsJSON = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    const existingGoals: Goal[] = existingGoalsJSON ? JSON.parse(existingGoalsJSON) : [];
    
    const updatedGoals = [...existingGoals, goal];
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

export const getGoals = async (): Promise<Goal[]> => {
  try {
    const goalsJSON = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (!goalsJSON) return [];
    
    const goals: Goal[] = JSON.parse(goalsJSON);
    return goals.map(goal => ({
      ...goal,
      startDate: new Date(goal.startDate),
      endDate: new Date(goal.endDate)
    }));
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
};

export const updateGoal = async (updatedGoal: Goal): Promise<void> => {
  try {
    const goalsJSON = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (!goalsJSON) return;
    
    const goals: Goal[] = JSON.parse(goalsJSON);
    const updatedGoals = goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    const goalsJSON = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (!goalsJSON) return;
    
    const goals: Goal[] = JSON.parse(goalsJSON);
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};