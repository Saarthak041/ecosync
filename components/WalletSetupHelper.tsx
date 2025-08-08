import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useWallet } from './WalletConnectProvider';

export default function WalletSetupHelper() {
  const { address, connect, isConnected } = useWallet();

  const copyAddress = () => {
    if (address) {
      Clipboard.setString(address);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    }
  };

  const openSepoliaFaucet = () => {
    if (address) {
      Alert.alert(
        'Sepolia Faucet Instructions',
        `1. Copy your address: ${address}\n2. Go to https://sepoliafaucet.com/\n3. Paste your address\n4. Request 0.1 ETH (free)`,
        [
          { text: 'Copy Address', onPress: copyAddress },
          { text: 'OK' }
        ]
      );
    } else {
      Alert.alert('Connect Wallet First', 'Please connect your wallet to get your address');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Ethereum Setup Helper</Text>
      
      {!isConnected ? (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Step 1: Connect Your Wallet</Text>
          <TouchableOpacity style={styles.button} onPress={connect}>
            <Text style={styles.buttonText}>Connect MetaMask</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            Don't have MetaMask? Download it from metamask.io
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.subtitle}>✅ Wallet Connected!</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.label}>Your Wallet Address:</Text>
            <TouchableOpacity style={styles.addressBox} onPress={copyAddress}>
              <Text style={styles.address}>{address}</Text>
              <Text style={styles.copyHint}>Tap to copy</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.faucetButton} onPress={openSepoliaFaucet}>
            <Text style={styles.faucetButtonText}>🚰 Get Free Sepolia ETH</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>📋 Quick Setup Checklist:</Text>
        <Text style={styles.checklistItem}>☐ Sign up at infura.io (free)</Text>
        <Text style={styles.checklistItem}>☐ Create new project → Get Project ID</Text>
        <Text style={styles.checklistItem}>☐ Connect wallet above → Copy address</Text>
        <Text style={styles.checklistItem}>☐ Visit sepoliafaucet.com → Request ETH</Text>
        <Text style={styles.checklistItem}>☐ Update .env file with your keys</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  section: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  addressContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#374151',
  },
  addressBox: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#1f2937',
  },
  copyHint: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  faucetButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  faucetButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  checklistItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    paddingLeft: 10,
  },
});
