import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ArrowUpRight, Trash2 } from 'lucide-react-native';
import Card from './Card';
import { CarbonCredit } from '@/types/carbonData';

interface CarbonCreditCardProps {
  credit: CarbonCredit;
  onTransfer: (creditId: string) => void;
  onRetire: (creditId: string) => void;
}

const CarbonCreditCard: React.FC<CarbonCreditCardProps> = ({ credit, onTransfer, onRetire }) => {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: credit.imageUrl || 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg' }}
          style={styles.image}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{credit.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: credit.status === 'active' ? '#D1FAE5' : '#FEE2E2' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: credit.status === 'active' ? '#059669' : '#DC2626' }
            ]}>
              {credit.status === 'active' ? 'Active' : 'Retired'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Project ID:</Text>
          <Text style={styles.detailValue}>{credit.projectId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vintage:</Text>
          <Text style={styles.detailValue}>{credit.vintage}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{credit.quantity} tCO₂e</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Serial Number:</Text>
          <Text style={styles.detailValue}>{credit.serialNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registry:</Text>
          <Text style={styles.detailValue}>{credit.registry}</Text>
        </View>
      </View>
      
      {credit.status === 'active' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.transferButton}
            onPress={() => onTransfer(credit.id)}
          >
            <ArrowUpRight size={16} color="#3B82F6" />
            <Text style={styles.transferButtonText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.retireButton}
            onPress={() => onRetire(credit.id)}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text style={styles.retireButtonText}>Retire</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flexShrink: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  transferButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginLeft: 8,
  },
  retireButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  retireButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default CarbonCreditCard;