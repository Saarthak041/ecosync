import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
}

export default function ActivityCard({ 
  title, 
  description, 
  icon, 
  onPress, 
  color = '#10B981' 
}: ActivityCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});