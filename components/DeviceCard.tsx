import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Card from './Card';

interface DeviceCardProps {
  name: string;
  location: string;
  isOnline: boolean;
  isActive: boolean;
  energyUsage?: string;
  icon: React.ReactNode;
  onToggle: (value: boolean) => void;
}

export default function DeviceCard({ 
  name, 
  location, 
  isOnline, 
  isActive, 
  energyUsage, 
  icon, 
  onToggle 
}: DeviceCardProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: isOnline ? '#10B98115' : '#EF444415' }
          ]}>
            {icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
        <Switch
          value={isActive}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#10B981' }}
          thumbColor={isActive ? '#ffffff' : '#ffffff'}
          disabled={!isOnline}
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isOnline ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        {energyUsage && (
          <Text style={styles.energyUsage}>{energyUsage}</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  energyUsage: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
});