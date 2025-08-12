import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  stats: {
    totalEmissions: number;
    devicesCount: number;
    lastActive: string;
  };
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  async init() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        this.token = token;
        await this.loadProfile();
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });
    
    const { user, token } = response.data;
    await this.setAuth(user, token);
    return { user, token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    const { user, token } = response.data;
    await this.setAuth(user, token);
    return { user, token };
  }

  async logout() {
    this.token = null;
    this.user = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  async loadProfile(): Promise<User | null> {
    if (!this.token) return null;
    
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      this.user = response.data.user;
      await AsyncStorage.setItem('user_data', JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      console.error('Failed to load profile:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.logout();
      }
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.token) throw new Error('Not authenticated');
    
    const response = await axios.patch(`${API_URL}/auth/profile`, updates, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    this.user = response.data.user;
    await AsyncStorage.setItem('user_data', JSON.stringify(this.user));
    return this.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.token) throw new Error('Not authenticated');
    
    await axios.patch(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }

  private async setAuth(user: User, token: string) {
    this.user = user;
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Helper to add auth headers to other API calls
  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authService = new AuthService();
