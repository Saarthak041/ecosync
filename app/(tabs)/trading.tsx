import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Card from '@/components/Card';
import StatsCard from '@/components/StatsCard';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react-native';

interface CarbonCredit {
  id: string;
  company: string;
  price: number;
  change: number;
  volume: string;
  type: 'renewable' | 'forestry' | 'technology';
}

export default function Trading() {
  const [selectedTab, setSelectedTab] = useState<'market' | 'portfolio'>('market');

  const carbonCredits: CarbonCredit[] = [
    {
      id: '1',
      company: 'Renewable Energy Co.',
      price: 45.20,
      change: 2.4,
      volume: '1.2M',
      type: 'renewable',
    },
    {
      id: '2',
      company: 'Forest Carbon Ltd.',
      price: 38.50,
      change: -1.2,
      volume: '850K',
      type: 'forestry',
    },
    {
      id: '3',
      company: 'CleanTech Solutions',
      price: 52.80,
      change: 4.1,
      volume: '2.1M',
      type: 'technology',
    },
    {
      id: '4',
      company: 'Solar Power Corp.',
      price: 41.75,
      change: 1.8,
      volume: '950K',
      type: 'renewable',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'renewable': return '#10B981';
      case 'forestry': return '#059669';
      case 'technology': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'renewable': return 'Renewable';
      case 'forestry': return 'Forestry';
      case 'technology': return 'Technology';
      default: return 'Other';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Carbon Trading</Text>
            <Text style={styles.subtitle}>
              Trade carbon credits on the blockchain marketplace
            </Text>
          </View>
          <TouchableOpacity style={styles.walletButton}>
            <Wallet size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Portfolio Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Portfolio Overview</Text>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total Value"
              value="₹2,45,680"
              unit=""
              trend={12.4}
              icon={<Coins size={20} color="#10B981" />}
              color="#10B981"
            />
            <StatsCard
              title="Today's P&L"
              value="₹5,240"
              unit=""
              trend={8.2}
              icon={<TrendingUp size={20} color="#3B82F6" />}
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'market' && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab('market')}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === 'market' && styles.tabButtonTextActive
            ]}>
              Market
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'portfolio' && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab('portfolio')}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === 'portfolio' && styles.tabButtonTextActive
            ]}>
              Portfolio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Market View */}
        {selectedTab === 'market' && (
          <View style={styles.marketContainer}>
            <Text style={styles.sectionTitle}>Live Carbon Credits</Text>
            {carbonCredits.map((credit) => (
              <Card key={credit.id} style={styles.creditCard}>
                <View style={styles.creditHeader}>
                  <View style={styles.creditInfo}>
                    <View style={styles.companyInfo}>
                      <Building2 size={20} color="#6B7280" />
                      <Text style={styles.companyName}>{credit.company}</Text>
                    </View>
                    <View style={[
                      styles.typeBadge,
                      { backgroundColor: `${getTypeColor(credit.type)}15` }
                    ]}>
                      <Text style={[
                        styles.typeText,
                        { color: getTypeColor(credit.type) }
                      ]}>
                        {getTypeLabel(credit.type)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.creditDetails}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.price}>₹{credit.price.toFixed(2)}</Text>
                    <Text style={styles.volume}>Vol: {credit.volume}</Text>
                  </View>
                  <View style={styles.changeInfo}>
                    <View style={[
                      styles.changeContainer,
                      { backgroundColor: credit.change > 0 ? '#10B98115' : '#EF444415' }
                    ]}>
                      {credit.change > 0 ? 
                        <TrendingUp size={14} color="#10B981" /> : 
                        <TrendingDown size={14} color="#EF4444" />
                      }
                      <Text style={[
                        styles.changeText,
                        { color: credit.change > 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {credit.change > 0 ? '+' : ''}{credit.change}%
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.buyButton}>
                    <ArrowUpRight size={16} color="#ffffff" />
                    <Text style={styles.buyButtonText}>Buy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sellButton}>
                    <ArrowDownLeft size={16} color="#EF4444" />
                    <Text style={styles.sellButtonText}>Sell</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Portfolio View */}
        {selectedTab === 'portfolio' && (
          <View style={styles.portfolioContainer}>
            <Text style={styles.sectionTitle}>Your Holdings</Text>
            <Card>
              <View style={styles.holdingItem}>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingCompany}>Renewable Energy Co.</Text>
                  <Text style={styles.holdingDetails}>150 credits • ₹45.20 avg</Text>
                </View>
                <View style={styles.holdingValue}>
                  <Text style={styles.holdingPrice}>₹6,780</Text>
                  <Text style={styles.holdingGain}>+₹340</Text>
                </View>
              </View>
            </Card>
            <Card>
              <View style={styles.holdingItem}>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingCompany}>CleanTech Solutions</Text>
                  <Text style={styles.holdingDetails}>200 credits • ₹48.50 avg</Text>
                </View>
                <View style={styles.holdingValue}>
                  <Text style={styles.holdingPrice}>₹10,560</Text>
                  <Text style={styles.holdingGain}>+₹860</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Blockchain Info */}
        <Card style={styles.blockchainCard}>
          <Text style={styles.cardTitle}>🔗 Blockchain Verified</Text>
          <Text style={styles.blockchainText}>
            All transactions are recorded on the blockchain for complete transparency. 
            Smart contracts ensure secure and automated trading with zero intermediaries.
          </Text>
        </Card>
      </ScrollView>
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
  walletButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  marketContainer: {
    paddingHorizontal: 20,
  },
  creditCard: {
    marginVertical: 4,
  },
  creditHeader: {
    marginBottom: 12,
  },
  creditInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  creditDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInfo: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  volume: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  changeInfo: {
    alignItems: 'flex-end',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  buyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  sellButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sellButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  portfolioContainer: {
    paddingHorizontal: 20,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingCompany: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  holdingDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  holdingValue: {
    alignItems: 'flex-end',
  },
  holdingPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  holdingGain: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  blockchainCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 100,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  blockchainText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});