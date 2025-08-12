import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Device {
  _id: string;
  name: string;
  location: string;
  type: 'light' | 'plug' | 'fan' | 'other';
  isOnline: boolean;
  isActive: boolean;
  energyUsage?: string;
  ratedWatts?: number;
}

export async function listDevices(): Promise<Device[]> {
  const res = await axios.get(`${API_URL}/devices`);
  return res.data.devices;
}

export async function toggleDevice(id: string, isActive: boolean): Promise<Device> {
  const res = await axios.patch(`${API_URL}/devices/${id}/toggle`, { isActive });
  return res.data.device;
}

// Thermostat removed in this hardware scope
