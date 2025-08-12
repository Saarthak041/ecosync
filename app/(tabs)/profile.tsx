import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert, Switch } from 'react-native';
import { Target, Plus, Settings, LogOut, User, Bell, Palette, Globe } from 'lucide-react-native';
import { Goal } from '../../types/carbonData';
import { getGoals, saveGoal, updateGoal, deleteGoal } from '../../utils/storage';
import GoalCard from '@/components/GoalCard';
import AddGoalForm from '@/components/AddGoalForm';
import { authService, User as AuthUser } from '@/services/authService';

export default function Profile() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    loadGoals();
    loadUserProfile();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const goalsData = await getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userProfile = await authService.loadProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleAddGoal = async (goal: Goal) => {
    try {
      await saveGoal(goal);
      setGoals(prevGoals => [...prevGoals, goal]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    try {
      await updateGoal(updatedGoal);
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal)
      );
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
            } catch (error) {
              console.error('Error deleting goal:', error);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // The root layout will handle navigation back to auth
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    if (!user) return;
    
    try {
      const updatedUser = await authService.updateProfile({
        preferences: {
          ...user.preferences,
          [key]: value
        }
      });
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  // Sort goals: active first, then by end date (closest first)
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });

  const activeGoals = sortedGoals.filter(goal => !goal.isCompleted);
  const completedGoals = sortedGoals.filter(goal => goal.isCompleted);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              Manage your account and preferences
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
            <LogOut size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userSection}>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <User size={32} color="#10B981" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userStats}>
                  {user.stats.devicesCount} devices • {user.stats.totalEmissions.toFixed(1)} kg CO₂ saved
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Preferences */}
        {user && (
          <View style={styles.preferencesSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <Bell size={20} color="#6B7280" />
                <Text style={styles.preferenceText}>Push Notifications</Text>
              </View>
              <Switch
                value={user.preferences.notifications}
                onValueChange={(value) => handlePreferenceChange('notifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <Palette size={20} color="#6B7280" />
                <Text style={styles.preferenceText}>Theme</Text>
              </View>
              <View style={styles.themeSelector}>
                {(['light', 'dark', 'auto'] as const).map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.themeOption,
                      user.preferences.theme === theme && styles.themeOptionActive
                    ]}
                    onPress={() => handlePreferenceChange('theme', theme)}
                  >
                    <Text style={[
                      styles.themeOptionText,
                      user.preferences.theme === theme && styles.themeOptionTextActive
                    ]}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <Globe size={20} color="#6B7280" />
                <Text style={styles.preferenceText}>Language</Text>
              </View>
              <Text style={styles.preferenceValue}>{user.preferences.language.toUpperCase()}</Text>
            </View>
          </View>
        )}

        {/* Add Goal Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Create New Goal</Text>
        </TouchableOpacity>

        {/* Active Goals */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          
          {activeGoals.length > 0 ? (
            activeGoals.map(goal => (
              <GoalCard 
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Target size={40} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No active goals</Text>
              <Text style={styles.emptyStateSubtext}>
                Create a new goal to start tracking your progress
              </Text>
            </View>
          )}
        </View>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Completed Goals</Text>
            
            {completedGoals.map(goal => (
              <GoalCard 
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>🎯 Setting Effective Goals</Text>
          <Text style={styles.tipText}>
            Start with small, achievable goals and gradually increase your targets. 
            Research shows that breaking down larger goals into smaller milestones 
            increases your chances of success by 76%.
          </Text>
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <AddGoalForm 
            onSave={handleAddGoal}
            onCancel={() => setShowAddModal(false)}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  userStats: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  preferencesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  preferenceValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  themeOptionActive: {
    backgroundColor: '#10B981',
  },
  themeOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  themeOptionTextActive: {
    color: '#FFFFFF',
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
  goalsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 8,
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