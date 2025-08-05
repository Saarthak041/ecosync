import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import DeviceCard from '@/components/DeviceCard';
import StatsCard from '@/components/StatsCard';
import Card from '@/components/Card';
import { Lightbulb, Tv, Wind, Thermometer, Plug, Zap, Chrome as Home, Settings } from 'lucide-react-native';

interface Device {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  isActive: boolean;
  energyUsage?: string;
  icon: React.ReactNode;
}

export default function SmartHome() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Living Room Lights',
      location: 'Living Room',
      isOnline: true,
      isActive: true,
      energyUsage: '24W',
      icon: <Lightbulb size={20} color="#F59E0B" />,
    },
    {
      id: '2',
      name: 'Smart TV',
      location: 'Living Room',
      isOnline: true,
      isActive: false,
      energyUsage: '0W',
      icon: <Tv size={20} color="#6366F1" />,
    },
    {
      id: '3',
      name: 'Air Conditioner',
      location: 'Bedroom',
      isOnline: true,
      isActive: true,
      energyUsage: '1.2kW',
      icon: <Wind size={20} color="#10B981" />,
    },
    {
      id: '4',
      name: 'Water Heater',
      location: 'Bathroom',
      isOnline: false,
      isActive: false,
      energyUsage: '0W',
      icon: <Thermometer size={20} color="#EF4444" />,
    },
    {
      id: '5',
      name: 'Smart Plug',
      location: 'Kitchen',
      isOnline: true,
      isActive: true,
      energyUsage: '15W',
      icon: <Plug size={20} color="#8B5CF6" />,
    },
  ]);

  const handleDeviceToggle = (deviceId: string, value: boolean) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            isActive: value,
            energyUsage: value ? device.energyUsage : '0W'
          }
        : device
    ));
  };

  const totalActiveDevices = devices.filter(d => d.isActive).length;
  const totalPowerConsumption = devices
    .filter(d => d.isActive)
    .reduce((sum, d) => {
      const usage = parseFloat(d.energyUsage?.replace(/[^\d.]/g, '') || '0');
      return sum + usage;
    }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Smart Home</Text>
            <Text style={styles.subtitle}>
              Monitor and control your connected devices
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Energy Overview */}
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Energy Overview</Text>
          <View style={styles.statsRow}>
            <StatsCard
              title="Active Devices"
              value={totalActiveDevices.toString()}
              unit="devices"
              icon={<Home size={20} color="#10B981" />}
              color="#10B981"
            />
            <StatsCard
              title="Power Usage"
              value={totalPowerConsumption.toFixed(1)}
              unit="kW"
              icon={<Zap size={20} color="#F59E0B" />}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Devices List */}
        <View style={styles.devicesContainer}>
          <Text style={styles.sectionTitle}>Your Devices</Text>
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              name={device.name}
              location={device.location}
              isOnline={device.isOnline}
              isActive={device.isActive}
              energyUsage={device.energyUsage}
              icon={device.icon}
              onToggle={(value) => handleDeviceToggle(device.id, value)}
            />
          ))}
        </View>

        {/* Energy Saving Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.cardTitle}>🔋 Energy Saving Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Turn off devices when not in use to save up to 30% energy
            </Text>
            <Text style={styles.tipItem}>
              • Use smart scheduling to automate device control
            </Text>
            <Text style={styles.tipItem}>
              • Monitor standby power consumption regularly
            </Text>
          </View>
        </Card>

        {/* Automation Card */}
        <Card style={styles.automationCard}>
          <Text style={styles.cardTitle}>⚡ Smart Automation</Text>
          <Text style={styles.automationText}>
            Enable location-based automation to turn off devices when you leave home.
          </Text>
          <TouchableOpacity style={styles.automationButton}>
            <Text style={styles.automationButtonText}>Setup Automation</Text>
          </TouchableOpacity>
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewContainer: {
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
  devicesContainer: {
    paddingHorizontal: 20,
  },
  tipsCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  automationCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 100,
  },
  automationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  automationButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  automationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});