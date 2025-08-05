import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Goal } from '../types/carbonData';
import { Car, Utensils, Globe } from 'lucide-react-native';

interface AddGoalFormProps {
  onSave: (goal: Goal) => void;
  onCancel: () => void;
}

const AddGoalForm: React.FC<AddGoalFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetEmission, setTargetEmission] = useState('');
  const [duration, setDuration] = useState('30'); // Default 30 days
  const [category, setCategory] = useState<'transport' | 'food' | 'overall'>('overall');
  
  const handleSave = () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a goal title');
      return;
    }
    
    if (!targetEmission || isNaN(Number(targetEmission)) || Number(targetEmission) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid target emission reduction');
      return;
    }
    
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid duration in days');
      return;
    }
    
    // Create start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(duration));
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || 'No description provided',
      targetEmission: Number(targetEmission),
      currentProgress: 0,
      startDate,
      endDate,
      category,
      isCompleted: false
    };
    
    onSave(newGoal);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Goal</Text>
      
      <Text style={styles.sectionTitle}>Goal Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter goal title"
      />
      
      <Text style={styles.sectionTitle}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your goal"
        multiline
      />
      
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === 'transport' && styles.categoryButtonActive
          ]}
          onPress={() => setCategory('transport')}
        >
          <Car 
            size={24} 
            color={category === 'transport' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.categoryText,
              category === 'transport' && styles.categoryTextActive
            ]}
          >
            Transport
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === 'food' && styles.categoryButtonActive,
            { backgroundColor: category === 'food' ? '#F97316' : '#F3F4F6' }
          ]}
          onPress={() => setCategory('food')}
        >
          <Utensils 
            size={24} 
            color={category === 'food' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.categoryText,
              category === 'food' && styles.categoryTextActive
            ]}
          >
            Food
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === 'overall' && styles.categoryButtonActive,
            { backgroundColor: category === 'overall' ? '#10B981' : '#F3F4F6' }
          ]}
          onPress={() => setCategory('overall')}
        >
          <Globe 
            size={24} 
            color={category === 'overall' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.categoryText,
              category === 'overall' && styles.categoryTextActive
            ]}
          >
            Overall
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Target CO₂ Reduction (kg)</Text>
      <TextInput
        style={styles.input}
        value={targetEmission}
        onChangeText={setTargetEmission}
        placeholder="Enter target CO₂ reduction in kg"
        keyboardType="numeric"
      />
      
      <Text style={styles.sectionTitle}>Duration (days)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Enter duration in days"
        keyboardType="numeric"
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Create Goal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    height: 80,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});

export default AddGoalForm;