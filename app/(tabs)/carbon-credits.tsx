import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Leaf, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Trash2, X } from 'lucide-react-native';
import Card from '@/components/Card';
import { useWallet } from '@/components/WalletConnectProvider';
import carbonCreditService, { CarbonCredit, CarbonTransaction } from '@/services/carbonCreditService';
import { initializeMockData, mockCarbonCredits, mockTransactions } from '@/utils/mockData';
import { shadowPresets } from '@/utils/shadowUtils';

export default function CarbonCredits() {
  const { isConnected, address, provider, signer, connect, disconnect } = useWallet();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false initially
  const [selectedTab, setSelectedTab] = useState<'credits' | 'history'>('credits');
  const [refreshing, setRefreshing] = useState(false);
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  const [testWalletConnected, setTestWalletConnected] = useState(false);
  
  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCreditId, setTransferCreditId] = useState<string>('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  
  // Retirement modal state
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireCreditId, setRetireCreditId] = useState<string>('');
  const [retireQuantity, setRetireQuantity] = useState('');
  const [retireReason, setRetireReason] = useState('');

  useEffect(() => {
    if (testModeEnabled) {
      // Initialize mock data for testing
      initializeMockData();
      console.log('🧪 Test mode enabled - using mock data');
    }
  }, [testModeEnabled]);

  useEffect(() => {
    // Load data when wallet is connected (real or test mode)
    if ((isConnected && address) || (testModeEnabled && testWalletConnected)) {
      loadData();
      if (provider && signer && !testModeEnabled) {
        carbonCreditService.initialize(provider, signer);
      }
    }
  }, [isConnected, address, provider, signer, testModeEnabled, testWalletConnected]);

  const loadData = async (useCache = true) => {
    console.log('📊 Loading carbon credits data...');
    setIsLoading(true);
    
    try {
      if (testModeEnabled) {
        // Use mock data for testing - no address requirement
        console.log('🧪 Loading mock data...');
        setCredits(mockCarbonCredits);
        setTransactions(mockTransactions);
        console.log('✅ Loaded mock data:', mockCarbonCredits.length, 'credits');
        setIsLoading(false);
        return;
      }

      // Real blockchain data - requires address
      if (!address) {
        console.log('❌ No address available for blockchain data');
        setIsLoading(false);
        return;
      }

      // Try to load from cache first
      if (useCache) {
        const cachedData = await carbonCreditService.getCachedUserData(address);
        if (cachedData) {
          setCredits(cachedData.credits);
          setTransactions(cachedData.transactions);
          setIsLoading(false);
          // Still fetch fresh data in background
          loadFreshData();
          return;
        }
      }

      await loadFreshData();
    } catch (error) {
      console.error('❌ Error loading carbon credits data:', error);
      Alert.alert('Error', 'Failed to load carbon credit data');
      setIsLoading(false);
    }
  };

  const loadFreshData = async () => {
    if (!address) return;

    try {
      const [creditsData, transactionsData] = await Promise.all([
        carbonCreditService.getUserCredits(address),
        carbonCreditService.getUserTransactions(address)
      ]);

      setCredits(creditsData);
      setTransactions(transactionsData);

      // Cache the data
      await carbonCreditService.cacheUserData(address, creditsData, transactionsData);
    } catch (error) {
      console.error('Error loading fresh data:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData(false); // Force fresh data
    } finally {
      setRefreshing(false);
    }
  };

  const handleTransfer = (creditId: string) => {
    setTransferCreditId(creditId);
    setTransferAddress('');
    setTransferQuantity('');
    setShowTransferModal(true);
  };

  const handleRetire = (creditId: string) => {
    setRetireCreditId(creditId);
    setRetireQuantity('');
    setRetireReason('');
    setShowRetireModal(true);
  };

  const executeTransfer = async () => {
    if (!transferAddress || !transferQuantity || !transferCreditId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const txHash = await carbonCreditService.transferCredit(
        transferCreditId,
        transferAddress,
        parseInt(transferQuantity)
      );

      Alert.alert(
        'Transfer Successful',
        `Carbon credits transferred successfully!\nTransaction: ${txHash.substring(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowTransferModal(false);
              handleRefresh();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Transfer error:', error);
      Alert.alert('Transfer Failed', error.message || 'Failed to transfer carbon credits');
    } finally {
      setIsLoading(false);
    }
  };

  const executeRetirement = async () => {
    if (!retireQuantity || !retireReason || !retireCreditId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const txHash = await carbonCreditService.retireCredit(
        retireCreditId,
        parseInt(retireQuantity),
        retireReason
      );

      Alert.alert(
        'Retirement Successful',
        `Carbon credits retired successfully!\nTransaction: ${txHash.substring(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowRetireModal(false);
              handleRefresh();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Retirement error:', error);
      Alert.alert('Retirement Failed', error.message || 'Failed to retire carbon credits');
    } finally {
      setIsLoading(false);
    }
  };

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

  const getTotalCredits = () => {
    return credits
      .filter(credit => credit.status === 'active')
      .reduce((sum, credit) => sum + (credit.currentBalance || credit.quantity), 0);
  };

  const getRetiredCredits = () => {
    return credits
      .filter(credit => credit.status === 'retired')
      .reduce((sum, credit) => sum + credit.quantity, 0);
  };

  const handleConnectWallet = async () => {
    try {
      console.log('🔗 Attempting wallet connection...');
      
      if (testModeEnabled) {
        // In test mode, simulate immediate connection WITHOUT calling real connect
        console.log('🧪 Test mode: Simulating wallet connection');
        
        // Set test wallet as connected
        setTestWalletConnected(true);
        
        // Simulate connection delay
        setTimeout(() => {
          console.log('✅ Mock wallet connected successfully');
          Alert.alert('Success', 'Test wallet connected successfully!', [
            { text: 'OK', onPress: () => {
              // Load mock data after connection
              loadData();
            }}
          ]);
        }, 500);
        
        return; // Exit early - don't call real connect()
      }
      
      // Only call real wallet connection when NOT in test mode
      await connect();
      Alert.alert('Success', 'Wallet connected successfully!');
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      Alert.alert('Error', 'Failed to connect wallet. Please make sure you have MetaMask installed.');
    }
  };

  const toggleTestMode = () => {
    setTestModeEnabled(!testModeEnabled);
    Alert.alert(
      'Test Mode',
      testModeEnabled ? 'Switched to live blockchain mode' : 'Switched to test mode with mock data',
      [{ text: 'OK', onPress: () => loadData() }]
    );
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if wallet is connected (real wallet or test mode)
  const isWalletConnected = testModeEnabled ? testWalletConnected : isConnected;

  if (!isWalletConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectContainer}>
          <Wallet size={80} color="#10B981" />
          <Text style={styles.connectTitle}>Connect Your Wallet</Text>
          <Text style={styles.connectSubtitle}>
            Connect your Web3 wallet to view and manage your carbon credits
          </Text>
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet}>
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
          
          {/* Test Mode Toggle */}
          <TouchableOpacity style={styles.testModeButton} onPress={toggleTestMode}>
            <Text style={styles.testModeButtonText}>
              {testModeEnabled ? '🧪 Test Mode (Mock Data)' : '🔗 Live Mode'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && credits.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading carbon credits...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Carbon Credits</Text>
            <Text style={styles.subtitle}>
              Manage your carbon credit portfolio
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={20} color={refreshing ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.walletButton}
              onPress={isWalletConnected ? disconnect : handleConnectWallet}
            >
              <Wallet size={24} color={isWalletConnected ? "#10B981" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Status */}
        <View style={styles.walletStatus}>
          {isWalletConnected ? (
            <View style={styles.connectedWallet}>
              <Text style={styles.walletLabel}>Connected Wallet</Text>
              <Text style={styles.walletAddress}>
                {testModeEnabled && testWalletConnected 
                  ? formatAddress('0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91')
                  : address 
                    ? formatAddress(address)
                    : 'Not connected'
                }
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.connectWalletButton}
              onPress={handleConnectWallet}
            >
              <Wallet size={18} color="#FFFFFF" />
              <Text style={styles.connectWalletText}>Connect Wallet</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Overview */}
        {isConnected && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Credits</Text>
              <Text style={styles.statValue}>{getTotalCredits()}</Text>
              <Text style={styles.statUnit}>tCO₂e</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Retired</Text>
              <Text style={styles.statValue}>{getRetiredCredits()}</Text>
              <Text style={styles.statUnit}>tCO₂e</Text>
            </View>
          </View>
        )}

        {isConnected && (
          <>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === 'credits' && styles.tabButtonActive
                ]}
                onPress={() => setSelectedTab('credits')}
              >
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === 'credits' && styles.tabButtonTextActive
                ]}>
                  My Credits
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === 'history' && styles.tabButtonActive
                ]}
                onPress={() => setSelectedTab('history')}
              >
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === 'history' && styles.tabButtonTextActive
                ]}>
                  Transaction History
                </Text>
              </TouchableOpacity>
            </View>

            {/* Credits List */}
            {selectedTab === 'credits' && (
              <View style={styles.creditsContainer}>
                {credits.length > 0 ? (
                  credits.map(credit => (
                    <Card key={credit.id} style={styles.creditCard}>
                      <View style={styles.creditHeader}>
                        <Image 
                          source={{ uri: credit.imageUrl }}
                          style={styles.creditImage}
                        />
                        <View style={styles.creditTitleContainer}>
                          <Text style={styles.creditTitle}>{credit.name}</Text>
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
                      
                      <View style={styles.creditDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Project ID:</Text>
                          <Text style={styles.detailValue}>{credit.projectId}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Vintage:</Text>
                          <Text style={styles.detailValue}>{credit.vintage}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Balance:</Text>
                          <Text style={styles.detailValue}>{credit.currentBalance || credit.quantity} tCO₂e</Text>
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
                      
                      {credit.status === 'active' && (credit.currentBalance || credit.quantity) > 0 && (
                        <View style={styles.creditActions}>
                          <TouchableOpacity 
                            style={styles.transferButton}
                            onPress={() => handleTransfer(credit.id)}
                          >
                            <ArrowUpRight size={16} color="#3B82F6" />
                            <Text style={styles.transferButtonText}>Transfer</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.retireButton}
                            onPress={() => handleRetire(credit.id)}
                          >
                            <Trash2 size={16} color="#EF4444" />
                            <Text style={styles.retireButtonText}>Retire</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </Card>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Leaf size={48} color="#D1D5DB" />
                    <Text style={styles.emptyStateText}>No carbon credits yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Your carbon credits will appear here once you purchase them
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Transaction History */}
            {selectedTab === 'history' && (
              <View style={styles.historyContainer}>
                {transactions.length > 0 ? (
                  transactions
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map(transaction => {
                      const credit = credits.find(c => c.id === transaction.creditId);
                      return (
                        <Card key={transaction.id} style={styles.transactionCard}>
                          <View style={styles.transactionHeader}>
                            <View style={styles.transactionIconContainer}>
                              {renderTransactionIcon(transaction.type)}
                            </View>
                            <View style={styles.transactionInfo}>
                              <Text style={styles.transactionTitle}>
                                {renderTransactionTitle(transaction.type)} Carbon Credits
                              </Text>
                              <Text style={styles.transactionSubtitle}>
                                {credit?.name || 'Unknown Project'}
                              </Text>
                            </View>
                            <Text style={styles.transactionDate}>
                              {formatDate(transaction.date)}
                            </Text>
                          </View>
                          
                          <View style={styles.transactionDetails}>
                            <Text style={styles.transactionQuantity}>
                              {transaction.type === 'purchase' ? '+' : '-'}{transaction.quantity} tCO₂e
                            </Text>
                            {transaction.counterparty && (
                              <Text style={styles.transactionCounterparty}>
                                {transaction.type === 'purchase' ? 'From: ' : 'To: '}
                                {transaction.counterparty.substring(0, 6)}...{transaction.counterparty.substring(transaction.counterparty.length - 4)}
                              </Text>
                            )}
                            {transaction.reason && (
                              <Text style={styles.transactionReason}>
                                Reason: {transaction.reason}
                              </Text>
                            )}
                            {transaction.txHash && (
                              <Text style={styles.transactionHash}>
                                Tx: {transaction.txHash.substring(0, 10)}...
                              </Text>
                            )}
                          </View>
                        </Card>
                      );
                    })
                ) : (
                  <View style={styles.emptyState}>
                    <RefreshCw size={48} color="#D1D5DB" />
                    <Text style={styles.emptyStateText}>No transactions yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Your transaction history will appear here
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>🌿 About Carbon Credits</Text>
          <Text style={styles.infoText}>
            Carbon credits represent one metric ton of carbon dioxide equivalent (tCO₂e) that has been reduced, avoided, or removed from the atmosphere. By purchasing and retiring carbon credits, you can offset your carbon footprint and support climate action projects worldwide.
          </Text>
          <Text style={styles.infoText}>
            All carbon credits on this platform are tokenized on the Polygon blockchain for transparency and traceability.
          </Text>
        </Card>
      </ScrollView>

      {/* Transfer Modal */}
      <Modal
        visible={showTransferModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Carbon Credits</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Recipient Address</Text>
              <TextInput
                style={styles.textInput}
                value={transferAddress}
                onChangeText={setTransferAddress}
                placeholder="0x..."
                placeholderTextColor="#9CA3AF"
              />
              
              <Text style={styles.inputLabel}>Quantity (tCO₂e)</Text>
              <TextInput
                style={styles.textInput}
                value={transferQuantity}
                onChangeText={setTransferQuantity}
                placeholder="Enter quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowTransferModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={executeTransfer}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Processing...' : 'Transfer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Retirement Modal */}
      <Modal
        visible={showRetireModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Retire Carbon Credits</Text>
              <TouchableOpacity onPress={() => setShowRetireModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Quantity (tCO₂e)</Text>
              <TextInput
                style={styles.textInput}
                value={retireQuantity}
                onChangeText={setRetireQuantity}
                placeholder="Enter quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Reason for Retirement</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={retireReason}
                onChangeText={setRetireReason}
                placeholder="e.g., Personal carbon offset, Corporate sustainability"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowRetireModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: '#EF4444' }]}
                  onPress={executeRetirement}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Processing...' : 'Retire'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  walletButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletStatus: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  connectedWallet: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  walletLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  connectWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
  },
  connectWalletText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    ...shadowPresets.subtle,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statUnit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  tabButtonActive: {
    borderBottomColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  creditsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  creditCard: {
    marginBottom: 16,
  },
  creditHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  creditImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  creditTitleContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  creditTitle: {
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
  creditDetails: {
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
  creditActions: {
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
  historyContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  transactionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  transactionQuantity: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionCounterparty: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionReason: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionHash: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 100,
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    textAlign: 'center',
  },
  connectSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testModeButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  testModeButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
});