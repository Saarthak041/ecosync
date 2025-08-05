import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Apple, Beef, Wheat, Utensils, Salad } from 'lucide-react-native';
import { MealData } from '../types/carbonData';
import { calculateMealEmission } from '../utils/carbonCalculator';

interface AddMealFormProps {
  onSave: (meal: MealData) => void;
  onCancel: () => void;
}

const AddMealForm: React.FC<AddMealFormProps> = ({ onSave, onCancel }) => {
  const [mealType, setMealType] = useState<'vegetarian' | 'non-vegetarian' | 'vegan' | 'dairy' | 'processed'>('vegetarian');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  
  const handleSave = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid quantity');
      return;
    }
    
    const quantityValue = Number(quantity);
    const carbonEmission = calculateMealEmission(mealType, quantityValue);
    
    const newMeal: MealData = {
      id: Date.now().toString(),
      type: mealType,
      quantity: quantityValue,
      date: new Date(),
      carbonEmission,
      notes: notes.trim() || undefined
    };
    
    onSave(newMeal);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log a Meal</Text>
      
      <Text style={styles.sectionTitle}>Meal Type</Text>
      <View style={styles.mealTypeContainer}>
        <TouchableOpacity
          style={[
            styles.mealTypeButton,
            mealType === 'vegetarian' && styles.mealTypeButtonActive
          ]}
          onPress={() => setMealType('vegetarian')}
        >
          <Salad 
            size={24} 
            color={mealType === 'vegetarian' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.mealTypeText,
              mealType === 'vegetarian' && styles.mealTypeTextActive
            ]}
          >
            Vegetarian
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.mealTypeButton,
            mealType === 'non-vegetarian' && styles.mealTypeButtonActive,
            { backgroundColor: mealType === 'non-vegetarian' ? '#EF4444' : '#F3F4F6' }
          ]}
          onPress={() => setMealType('non-vegetarian')}
        >
          <Beef 
            size={24} 
            color={mealType === 'non-vegetarian' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.mealTypeText,
              mealType === 'non-vegetarian' && styles.mealTypeTextActive
            ]}
          >
            Non-Veg
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.mealTypeContainer}>
        <TouchableOpacity
          style={[
            styles.mealTypeButton,
            mealType === 'vegan' && styles.mealTypeButtonActive,
            { backgroundColor: mealType === 'vegan' ? '#059669' : '#F3F4F6' }
          ]}
          onPress={() => setMealType('vegan')}
        >
          <Apple 
            size={24} 
            color={mealType === 'vegan' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.mealTypeText,
              mealType === 'vegan' && styles.mealTypeTextActive
            ]}
          >
            Vegan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.mealTypeButton,
            mealType === 'dairy' && styles.mealTypeButtonActive,
            { backgroundColor: mealType === 'dairy' ? '#F59E0B' : '#F3F4F6' }
          ]}
          onPress={() => setMealType('dairy')}
        >
          <Wheat 
            size={24} 
            color={mealType === 'dairy' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.mealTypeText,
              mealType === 'dairy' && styles.mealTypeTextActive
            ]}
          >
            Dairy
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.mealTypeContainer}>
        <TouchableOpacity
          style={[
            styles.mealTypeButton,
            mealType === 'processed' && styles.mealTypeButtonActive,
            { backgroundColor: mealType === 'processed' ? '#8B5CF6' : '#F3F4F6' }
          ]}
          onPress={() => setMealType('processed')}
        >
          <Utensils 
            size={24} 
            color={mealType === 'processed' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.mealTypeText,
              mealType === 'processed' && styles.mealTypeTextActive
            ]}
          >
            Processed
          </Text>
        </TouchableOpacity>
        
        <View style={styles.mealTypeButton} />
      </View>
      
      <Text style={styles.sectionTitle}>Quantity (servings)</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter number of servings"
        keyboardType="numeric"
      />
      
      <Text style={styles.sectionTitle}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about this meal"
        multiline
      />
      
      <View style={styles.emissionPreview}>
        <Text style={styles.emissionPreviewLabel}>Estimated CO₂ Emission:</Text>
        <Text style={styles.emissionPreviewValue}>
          {quantity && !isNaN(Number(quantity)) && Number(quantity) > 0
            ? `${calculateMealEmission(mealType, Number(quantity)).toFixed(2)} kg`
            : '0.00 kg'}
        </Text>
      </View>
      
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
          <Text style={styles.saveButtonText}>Save Meal</Text>
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
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    height: 80,
  },
  mealTypeButtonActive: {
    backgroundColor: '#10B981',
  },
  mealTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
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
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  emissionPreview: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  emissionPreviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  emissionPreviewValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
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

export default AddMealForm;