import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react-native';
import Card from './Card';
import { CarbonTransaction, CarbonCredit } from '@/types/carbonData';

interface TransactionHistoryItemProps {
  transaction: CarbonTransaction;
  creditName: string;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({ 
  transaction, 
  creditName 
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTransactionIcon = (type: 'purchase' | 'transfer' | 'retirement') => {
    switch (type) {
      case 'purchase':
        return <ArrowDownLeft size={20} color="#10B981" />;
      case 'transfer':
        return <ArrowUpRight size={20} color="#3B82F6" />;
      case 'retirement':
        return <Trash2 size={20} color="#EF4444" />;
    }
  };

  const renderTransactionTitle = (type: 'purchase' | 'transfer' | 'retirement') => {
    switch (type) {
      case 'purchase':
        return 'Purchased';
      case 'transfer':
        return 'Transferred';
      case 'retirement':
        return 'Retired';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {renderTransactionIcon(transaction.type)}
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>
            {renderTransactionTitle(transaction.type)} Carbon Credits
          </Text>
          <Text style={styles.subtitle}>
            {creditName}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.quantity}>
          {transaction.type === 'purchase' ? '+' : '-'}{transaction.quantity} tCO₂e
        </Text>
        {transaction.counterparty && (
          <Text style={styles.counterparty}>
            {transaction.type === 'purchase' ? 'From: ' : 'To: '}
            {transaction.counterparty.substring(0, 6)}...{transaction.counterparty.substring(transaction.counterparty.length - 4)}
          </Text>
        )}
        {transaction.reason && (
          <Text style={styles.reason}>
            Reason: {transaction.reason}
          </Text>
        )}
        {transaction.txHash && (
          <Text style={styles.txHash}>
            Tx: {transaction.txHash.substring(0, 6)}...{transaction.txHash.substring(transaction.txHash.length - 4)}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  quantity: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  counterparty: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  txHash: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});

export default TransactionHistoryItem;