import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Device {
  _id: string;
  name: string;
  location: string;
  type: 'light' | 'plug' | 'thermostat' | 'other';
  isOnline: boolean;
  isActive: boolean;
  energyUsage?: string;
}

export async function listDevices(): Promise<Device[]> {
  const res = await axios.get(`${API_URL}/devices`);
  return res.data.devices;
}

export async function toggleDevice(id: string, isActive: boolean): Promise<Device> {
  const res = await axios.patch(`${API_URL}/devices/${id}/toggle`, { isActive });
  return res.data.device;
}

export async function setThermostat(id: string, targetTemp: number): Promise<Device> {
  const res = await axios.patch(`${API_URL}/thermostat/${id}`, { targetTemp });
  return res.data.device;
}
