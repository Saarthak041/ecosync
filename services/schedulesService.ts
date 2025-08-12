import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface SchedulePayload {
  isActive?: boolean;
  targetTemp?: number;
}

export interface Schedule {
  _id: string;
  name?: string;
  device: string | { _id: string; name: string };
  action: 'toggle' | 'thermostat';
  payload: SchedulePayload;
  cron: string;
  enabled: boolean;
  lastRunAt?: string;
}

export async function listSchedules(): Promise<Schedule[]> {
  const res = await axios.get(`${API_URL}/schedules`);
  return res.data.schedules;
}

export async function createSchedule(input: Omit<Schedule, '_id' | 'lastRunAt' | 'device'> & { device: string }): Promise<Schedule> {
  const res = await axios.post(`${API_URL}/schedules`, input);
  return res.data.schedule;
}

export async function updateSchedule(id: string, input: Partial<Omit<Schedule, '_id'>>): Promise<Schedule> {
  const res = await axios.patch(`${API_URL}/schedules/${id}`, input);
  return res.data.schedule;
}

export async function deleteSchedule(id: string): Promise<void> {
  await axios.delete(`${API_URL}/schedules/${id}`);
}


