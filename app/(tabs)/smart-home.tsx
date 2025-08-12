import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput, Switch } from 'react-native';
import DeviceCard from '@/components/DeviceCard';
import StatsCard from '@/components/StatsCard';
import Card from '@/components/Card';
import { Lightbulb, Tv, Wind, Plug, Zap, Chrome as Home, Settings } from 'lucide-react-native';
import { listDevices, toggleDevice, Device as ApiDevice } from '@/services/devicesService';
import { io, Socket } from 'socket.io-client';
// Optional: Firestore device mirror for web preview
// import { collection, onSnapshot } from 'firebase/firestore';
// import { getDb } from '@/services/firebaseClient';
import { createSchedule } from '@/services/schedulesService';

interface Device extends ApiDevice {
  icon: React.ReactNode;
}

function pickIcon(type: Device['type'], name: string) {
  if (type === 'fan' || /fan/i.test(name)) return <Wind size={20} color="#10B981" />;
  if (type === 'plug' || /plug/i.test(name)) return <Plug size={20} color="#8B5CF6" />;
  if (/tv/i.test(name)) return <Tv size={20} color="#6366F1" />;
  return <Lightbulb size={20} color="#F59E0B" />;
}

export default function SmartHome() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedName, setSchedName] = useState('');
  const [schedDeviceId, setSchedDeviceId] = useState<string | null>(null);
  const [schedAction, setSchedAction] = useState<'toggle'>('toggle');
  const [schedIsActive, setSchedIsActive] = useState(true);
  const [schedTargetTemp, setSchedTargetTemp] = useState('22');
  const [schedCron, setSchedCron] = useState('0 18 * * *'); // every day 18:00 UTC
  const [schedEnabled, setSchedEnabled] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const items = await listDevices();
      setDevices(items.map(d => ({ ...d, icon: pickIcon(d.type, d.name) })));
    } catch (e) {
      console.error('Failed to load devices', e);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Realtime updates
  useEffect(() => {
    const url = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
    const socket: Socket = io(url, { transports: ['websocket'] });
    socket.on('device:update', (device: ApiDevice) => {
      setDevices(prev => prev.map(d => d._id === device._id ? { ...d, ...device, icon: pickIcon(device.type as any, device.name) } : d));
    });
    return () => { socket.disconnect(); };
  }, []);

  // Firestore mirror (commented by default)
  // useEffect(() => {
  //   const db = getDb();
  //   const unsub = onSnapshot(collection(db, 'devices'), (snap) => {
  //     const m = new Map(devices.map(d => [d._id, d]));
  //     snap.docChanges().forEach((c) => {
  //       const id = c.doc.id;
  //       const data: any = c.doc.data();
  //       if (m.has(id)) {
  //         const prev = m.get(id)!;
  //         m.set(id, { ...prev, ...data, _id: id, icon: pickIcon(data.type as any, data.name) });
  //       }
  //     });
  //     setDevices(Array.from(m.values()));
  //   });
  //   return () => unsub();
  // }, [devices]);

  const handleDeviceToggle = async (deviceId: string, value: boolean) => {
    try {
      setBusyId(deviceId);
      const updated = await toggleDevice(deviceId, value);
      setDevices(prev => prev.map(d => d._id === updated._id ? { ...d, ...updated, icon: pickIcon(updated.type, updated.name) } : d));
    } catch (e) {
      console.error('Toggle failed', e);
    } finally { setBusyId(null); }
  };

  const activeCount = devices.filter(d => d.isActive).length;
  const totalPower = devices.filter(d => d.isActive).reduce((sum, d) => {
    const usage = parseFloat((d.energyUsage || '0').replace(/[^\d.]/g, '')) || 0;
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
          <TouchableOpacity style={styles.settingsButton} onPress={load}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Energy Overview */}
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Energy Overview</Text>
          <View style={styles.statsRow}>
            <StatsCard
              title="Active Devices"
              value={activeCount.toString()}
              unit="devices"
              icon={<Home size={20} color="#10B981" />}
              color="#10B981"
            />
            <StatsCard
              title="Power Usage"
              value={totalPower.toFixed(1)}
              unit="kW"
              icon={<Zap size={20} color="#F59E0B" />}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Devices List */}
        <View style={styles.devicesContainer}>
          <Text style={styles.sectionTitle}>Your Devices</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#10B981" />
          ) : (
            devices.map((device) => (
              <DeviceCard
                key={device._id}
                name={device.name}
                location={device.location}
                isOnline={device.isOnline}
                isActive={device.isActive}
                energyUsage={device.energyUsage}
                icon={device.icon}
                onToggle={(value) => handleDeviceToggle(device._id, value)}
              />
            ))
          )}
        </View>

        {/* Scheduling (minimal UI) */}
        <Card style={styles.tipsCard}>
          <Text style={styles.cardTitle}>🗓️ Schedule Device</Text>
          {!showScheduler ? (
            <TouchableOpacity style={styles.automationButton} onPress={() => setShowScheduler(true)}>
              <Text style={styles.automationButtonText}>Create Schedule</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 8 }}>
              <TextInput
                placeholder="Name (optional)"
                value={schedName}
                onChangeText={setSchedName}
                style={styles.input}
              />
              <Text style={styles.label}>Device</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {devices.map(d => (
                    <TouchableOpacity
                      key={d._id}
                      onPress={() => setSchedDeviceId(d._id)}
                      style={[styles.chip, schedDeviceId === d._id && styles.chipActive]}
                    >
                      <Text style={[styles.chipLabel, schedDeviceId === d._id && styles.chipLabelActive]}>{d.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Action</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity disabled style={[styles.chip, styles.chipActive]}>
                  <Text style={[styles.chipLabel, styles.chipLabelActive]}>Toggle</Text>
                </TouchableOpacity>
              </View>

              {schedAction === 'toggle' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.label}>Set state</Text>
                  <Switch value={schedIsActive} onValueChange={setSchedIsActive} />
                </View>
              ) : null}

              <Text style={styles.label}>CRON (UTC)</Text>
              <TextInput
                placeholder="* * * * *"
                value={schedCron}
                onChangeText={setSchedCron}
                style={styles.input}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.label}>Enabled</Text>
                <Switch value={schedEnabled} onValueChange={setSchedEnabled} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  disabled={creating}
                  style={[styles.automationButton, { opacity: creating ? 0.7 : 1 }]}
                  onPress={async () => {
                    if (!schedDeviceId) return;
                    setCreating(true);
                    try {
                      await createSchedule({
                        name: schedName || undefined,
                        device: schedDeviceId,
                        action: schedAction,
                        payload: { isActive: schedIsActive },
                        cron: schedCron,
                        enabled: schedEnabled,
                      });
                      setShowScheduler(false);
                      setSchedName('');
                      setSchedDeviceId(null);
                    } catch (e) {
                      console.error('Create schedule failed', e);
                    } finally {
                      setCreating(false);
                    }
                  }}
                >
                  <Text style={styles.automationButtonText}>{creating ? 'Creating...' : 'Save Schedule'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.automationButton, { backgroundColor: '#6B7280' }]} onPress={() => setShowScheduler(false)}>
                  <Text style={styles.automationButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* Tips & Automation */}
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  title: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1F2937' },
  subtitle: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280' },
  settingsButton: { padding: 8 },
  overviewContainer: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 12 },
  statsRow: { flexDirection: 'row' },
  devicesContainer: { padding: 16 },
  tipsCard: { marginHorizontal: 16 },
  automationCard: { margin: 16 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 12 },
  tipsList: {},
  tipItem: { fontSize: 14, color: '#374151', marginBottom: 6 },
  automationText: { fontSize: 14, color: '#374151', marginBottom: 10 },
  automationButton: { backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  automationButtonText: { color: '#fff', fontFamily: 'Inter-SemiBold' }
});