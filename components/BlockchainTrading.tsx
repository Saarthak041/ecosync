import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/components/WalletConnectProvider';
import carbonCreditService, { CarbonCredit, CarbonTransaction } from '@/services/carbonCreditService';
import { initializeMockData, mockCarbonCredits, mockTransactions } from '@/utils/mockData';

export default function BlockchainTrading() {
  const { isConnected, address, provider, signer, connect, chainId, balance } = useWallet();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'transfer' | 'retire'>('transfer');
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  const [testWalletConnected, setTestWalletConnected] = useState(false);
  
  // Form states
  const [recipientAddress, setRecipientAddress] = useState('');
  const [quantity, setQuantity] = useState('');
  const [retirementReason, setRetirementReason] = useState('');

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
      loadUserData();
    }
  }, [isConnected, address, testModeEnabled, testWalletConnected]);

  const loadUserData = async () => {
    console.log('📊 Loading user data...');
    setLoading(true);
    
    try {
      if (testModeEnabled) {
        // Use mock data for testing - no address requirement
        console.log('🧪 Loading mock data...');
        setCredits(mockCarbonCredits);
        setTransactions(mockTransactions);
        console.log('✅ Loaded mock data:', mockCarbonCredits.length, 'credits');
      } else {
        // Use real blockchain data - requires address
        if (!address) {
          console.log('❌ No address available for blockchain data');
          return;
        }
        
        const [userCredits, userTransactions] = await Promise.all([
          carbonCreditService.getUserCredits(address),
          carbonCreditService.getUserTransactions(address)
        ]);
        setCredits(userCredits);
        setTransactions(userTransactions);
        console.log('✅ Loaded blockchain data');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'Failed to load carbon credits data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
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
              loadUserData();
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

  const handleTransferCredit = async () => {
    if (!selectedCredit || !recipientAddress || !quantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const txHash = await carbonCreditService.transferCredits(
        recipientAddress,
        selectedCredit.tokenId,
        parseInt(quantity)
      );
      
      Alert.alert(
        'Transaction Submitted',
        `Transfer initiated! Transaction hash: ${txHash.slice(0, 10)}...`,
        [{ text: 'OK', onPress: () => {
          setModalVisible(false);
          loadUserData();
        }}]
      );
    } catch (error) {
      console.error('Error transferring credits:', error);
      Alert.alert('Error', 'Failed to transfer credits');
    } finally {
      setLoading(false);
    }
  };

  const handleRetireCredit = async () => {
    if (!selectedCredit || !quantity || !retirementReason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const txHash = await carbonCreditService.retireCredits(
        selectedCredit.tokenId,
        parseInt(quantity),
        retirementReason
      );
      
      Alert.alert(
        'Credits Retired',
        `Successfully retired ${quantity} credits! Transaction hash: ${txHash.slice(0, 10)}...`,
        [{ text: 'OK', onPress: () => {
          setModalVisible(false);
          loadUserData();
        }}]
      );
    } catch (error) {
      console.error('Error retiring credits:', error);
      Alert.alert('Error', 'Failed to retire credits');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (credit: CarbonCredit, action: 'transfer' | 'retire') => {
    setSelectedCredit(credit);
    setActionType(action);
    setModalVisible(true);
    setRecipientAddress('');
    setQuantity('');
    setRetirementReason('');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleTestMode = () => {
    setTestModeEnabled(!testModeEnabled);
    Alert.alert(
      'Test Mode',
      testModeEnabled ? 'Switched to live blockchain mode' : 'Switched to test mode with mock data',
      [{ text: 'OK', onPress: loadUserData }]
    );
  };

  // Check if wallet is connected (real wallet or test mode)
  const isWalletConnected = testModeEnabled ? testWalletConnected : isConnected;

  if (!isWalletConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.connectContainer}
        >
          <Ionicons name="wallet-outline" size={80} color="white" />
          <Text style={styles.connectTitle}>Connect Your Wallet</Text>
          <Text style={styles.connectSubtitle}>
            Connect your Web3 wallet to trade carbon credits on the blockchain
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
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Carbon Trading</Text>
            <Text style={styles.headerSubtitle}>
              {testModeEnabled && testWalletConnected 
                ? formatAddress('0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91')
                : address 
                  ? formatAddress(address) 
                  : 'Not connected'
              }
            </Text>
            {chainId && (
              <Text style={styles.networkInfo}>
                Network: {chainId === 137 ? 'Polygon' : chainId === 80001 ? 'Mumbai' : 'Unknown'}
              </Text>
            )}
            {balance && (
              <Text style={styles.balanceInfo}>
                Balance: {parseFloat(balance).toFixed(4)} MATIC
              </Text>
            )}
          </View>
          
          {/* Test Mode Indicator */}
          <TouchableOpacity style={styles.testModeIndicator} onPress={toggleTestMode}>
            <Text style={styles.testModeText}>
              {testModeEnabled ? '🧪 TEST MODE' : '🔗 LIVE MODE'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Portfolio Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Portfolio Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{credits.length}</Text>
              <Text style={styles.statLabel}>Credits Owned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {credits.reduce((sum, credit) => sum + (credit.currentBalance || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Tonnes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
        </View>

        {/* Credits List */}
        <View style={styles.creditsContainer}>
          <Text style={styles.sectionTitle}>Your Carbon Credits</Text>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
          ) : credits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>No carbon credits found</Text>
              <Text style={styles.emptyStateSubtext}>
                {testModeEnabled ? 'Test mode: Mock data will load after connection' : 'Connect with carbon credit issuers to get started'}
              </Text>
            </View>
          ) : (
            credits.map((credit) => (
              <CreditCard
                key={credit.id}
                credit={credit}
                onTransfer={() => openActionModal(credit, 'transfer')}
                onRetire={() => openActionModal(credit, 'retire')}
              />
            ))
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.slice(0, 5).map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'transfer' ? 'Transfer Credits' : 'Retire Credits'}
            </Text>
            
            {selectedCredit && (
              <Text style={styles.modalCreditInfo}>
                {selectedCredit.name} • Available: {selectedCredit.currentBalance}
              </Text>
            )}

            {actionType === 'transfer' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Recipient Address (0x...)"
                value={recipientAddress}
                onChangeText={setRecipientAddress}
              />
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />

            {actionType === 'retire' && (
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Retirement Reason"
                value={retirementReason}
                onChangeText={setRetirementReason}
                multiline
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitButton, loading && styles.disabledButton]} 
                onPress={actionType === 'transfer' ? handleTransferCredit : handleRetireCredit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>
                    {actionType === 'transfer' ? 'Transfer' : 'Retire'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CreditCard = ({ credit, onTransfer, onRetire }: {
  credit: CarbonCredit;
  onTransfer: () => void;
  onRetire: () => void;
}) => (
  <View style={styles.creditCard}>
    <View style={styles.creditHeader}>
      <Text style={styles.creditName}>{credit.name}</Text>
      <View style={[styles.creditStatus, credit.status === 'active' ? styles.activeStatus : styles.retiredStatus]}>
        <Text style={[styles.creditStatusText, credit.status === 'active' ? styles.activeStatusText : styles.retiredStatusText]}>
          {credit.status.toUpperCase()}
        </Text>
      </View>
    </View>
    <Text style={styles.creditDetails}>
      Project: {credit.projectId} • Vintage: {credit.vintage}
    </Text>
    <Text style={styles.creditDetails}>
      Registry: {credit.registry} • Balance: {credit.currentBalance}
    </Text>
    <Text style={styles.creditDetails}>
      Issuer: {credit.issuer.slice(0, 10)}...
    </Text>
    
    {credit.status === 'active' && (
      <View style={styles.creditActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onTransfer}>
          <Ionicons name="arrow-forward-outline" size={16} color="#667eea" />
          <Text style={styles.actionButtonText}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.retireButton]} onPress={onRetire}>
          <Ionicons name="checkmark-outline" size={16} color="#e74c3c" />
          <Text style={[styles.actionButtonText, styles.retireButtonText]}>Retire</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const TransactionItem = ({ transaction }: { transaction: CarbonTransaction }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <Ionicons 
        name={
          transaction.type === 'purchase' || transaction.type === 'issuance' ? 'add-circle-outline' :
          transaction.type === 'transfer' ? 'arrow-forward-outline' :
          'checkmark-circle-outline'
        } 
        size={24} 
        color="#667eea" 
      />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionType}>{transaction.type.toUpperCase()}</Text>
      <Text style={styles.transactionAmount}>{transaction.quantity} tonnes</Text>
      <Text style={styles.transactionDate}>
        {transaction.date.toLocaleDateString()}
      </Text>
    </View>
    {transaction.txHash && (
      <TouchableOpacity style={styles.transactionHash}>
        <Text style={styles.hashText}>
          {transaction.txHash.slice(0, 8)}...
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  connectSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  connectButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  testModeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  testModeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  networkInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
  },
  balanceInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  testModeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  testModeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  creditsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  creditCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  creditName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  creditStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#e8f5e8',
  },
  retiredStatus: {
    backgroundColor: '#fee2e2',
  },
  creditStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#28a745',
  },
  retiredStatusText: {
    color: '#dc3545',
  },
  creditDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  creditActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  actionButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  retireButton: {
    backgroundColor: '#ffeaea',
  },
  retireButtonText: {
    color: '#e74c3c',
  },
  transactionsContainer: {
    margin: 20,
    marginTop: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionHash: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hashText: {
    fontSize: 12,
    color: '#667eea',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCreditInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
