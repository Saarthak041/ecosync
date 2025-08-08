import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Goal } from '../types/carbonData';
import { Target, Check, Trash2 } from 'lucide-react-native';
import { shadowPresets } from '../utils/shadowUtils';

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate, onDelete }) => {
  const progressPercentage = Math.min(
    Math.round((goal.currentProgress / goal.targetEmission) * 100),
    100
  );
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const daysLeft = () => {
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const handleMarkComplete = () => {
    onUpdate({
      ...goal,
      isCompleted: true
    });
  };
  
  return (
    <View style={[
      styles.container,
      goal.isCompleted ? styles.completedContainer : null
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Target size={20} color={getCategoryColor(goal.category)} />
        </View>
        <Text style={styles.title}>{goal.title}</Text>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(goal.id)}
        >
          <Trash2 size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>{goal.description}</Text>
      
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
        </Text>
        {!goal.isCompleted && (
          <Text style={styles.daysLeft}>{daysLeft()} days left</Text>
        )}
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progressPercentage}%` },
              { backgroundColor: getCategoryColor(goal.category) }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progressPercentage}% Complete
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Target</Text>
          <Text style={styles.statValue}>{goal.targetEmission} kg CO₂</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>{goal.currentProgress} kg CO₂</Text>
        </View>
      </View>
      
      {!goal.isCompleted && (
        <TouchableOpacity 
          style={[
            styles.completeButton,
            { backgroundColor: getCategoryColor(goal.category) }
          ]}
          onPress={handleMarkComplete}
        >
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      )}
      
      {goal.isCompleted && (
        <View style={styles.completedBadge}>
          <Check size={14} color="#10B981" />
          <Text style={styles.completedText}>Goal Completed</Text>
        </View>
      )}
    </View>
  );
};

const getCategoryColor = (category: 'transport' | 'food' | 'overall') => {
  switch (category) {
    case 'transport':
      return '#3B82F6';
    case 'food':
      return '#F97316';
    case 'overall':
      return '#10B981';
    default:
      return '#10B981';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    ...shadowPresets.medium,
  },
  completedContainer: {
    backgroundColor: '#F9FAFB',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  daysLeft: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F97316',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  completedText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginLeft: 6,
  },
});

export default GoalCard;