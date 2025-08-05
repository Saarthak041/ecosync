import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Car, Bus, Brain as Train, Plane } from 'lucide-react-native';
import { TripData } from '../types/carbonData';
import { calculateTripEmission, determineFlightType } from '../utils/carbonCalculator';

interface AddTripFormProps {
  onSave: (trip: TripData) => void;
  onCancel: () => void;
}

const AddTripForm: React.FC<AddTripFormProps> = ({ onSave, onCancel }) => {
  const [tripType, setTripType] = useState<'car' | 'bus' | 'train' | 'flight'>('car');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleSave = () => {
    if (!distance || isNaN(Number(distance)) || Number(distance) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid distance');
      return;
    }
    
    const distanceValue = Number(distance);
    let carbonEmission = 0;
    
    if (tripType === 'flight') {
      const flightType = determineFlightType(distanceValue);
      carbonEmission = calculateTripEmission(tripType, distanceValue, flightType);
    } else {
      carbonEmission = calculateTripEmission(tripType, distanceValue);
    }
    
    const newTrip: TripData = {
      id: Date.now().toString(),
      type: tripType,
      distance: distanceValue,
      date: new Date(),
      carbonEmission,
      notes: notes.trim() || undefined
    };
    
    onSave(newTrip);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log a Trip</Text>
      
      <Text style={styles.sectionTitle}>Transport Type</Text>
      <View style={styles.transportTypeContainer}>
        <TouchableOpacity
          style={[
            styles.transportTypeButton,
            tripType === 'car' && styles.transportTypeButtonActive
          ]}
          onPress={() => setTripType('car')}
        >
          <Car 
            size={24} 
            color={tripType === 'car' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.transportTypeText,
              tripType === 'car' && styles.transportTypeTextActive
            ]}
          >
            Car
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.transportTypeButton,
            tripType === 'bus' && styles.transportTypeButtonActive
          ]}
          onPress={() => setTripType('bus')}
        >
          <Bus 
            size={24} 
            color={tripType === 'bus' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.transportTypeText,
              tripType === 'bus' && styles.transportTypeTextActive
            ]}
          >
            Bus
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.transportTypeButton,
            tripType === 'train' && styles.transportTypeButtonActive
          ]}
          onPress={() => setTripType('train')}
        >
          <Train 
            size={24} 
            color={tripType === 'train' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.transportTypeText,
              tripType === 'train' && styles.transportTypeTextActive
            ]}
          >
            Train
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.transportTypeButton,
            tripType === 'flight' && styles.transportTypeButtonActive
          ]}
          onPress={() => setTripType('flight')}
        >
          <Plane 
            size={24} 
            color={tripType === 'flight' ? '#FFFFFF' : '#6B7280'} 
          />
          <Text 
            style={[
              styles.transportTypeText,
              tripType === 'flight' && styles.transportTypeTextActive
            ]}
          >
            Flight
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Distance (km)</Text>
      <TextInput
        style={styles.input}
        value={distance}
        onChangeText={setDistance}
        placeholder="Enter distance in kilometers"
        keyboardType="numeric"
      />
      
      <Text style={styles.sectionTitle}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about this trip"
        multiline
      />
      
      <View style={styles.emissionPreview}>
        <Text style={styles.emissionPreviewLabel}>Estimated CO₂ Emission:</Text>
        <Text style={styles.emissionPreviewValue}>
          {distance && !isNaN(Number(distance)) && Number(distance) > 0
            ? tripType === 'flight'
              ? `${calculateTripEmission(tripType, Number(distance), determineFlightType(Number(distance))).toFixed(2)} kg`
              : `${calculateTripEmission(tripType, Number(distance)).toFixed(2)} kg`
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
          <Text style={styles.saveButtonText}>Save Trip</Text>
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
  transportTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  transportTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  transportTypeButtonActive: {
    backgroundColor: '#10B981',
  },
  transportTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
  },
  transportTypeTextActive: {
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

export default AddTripForm;