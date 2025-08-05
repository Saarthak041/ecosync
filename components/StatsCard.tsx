import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';

interface StatsCardProps {
  title: string;
  value: string;
  unit: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  unit, 
  trend, 
  icon, 
  color = '#10B981' 
}: StatsCardProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        {trend !== undefined && (
          <View style={[
            styles.trendBadge, 
            { backgroundColor: trend < 0 ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.trendText}>
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  unit: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});