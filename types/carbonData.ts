export interface TripData {
  id: string;
  type: 'car' | 'bus' | 'train' | 'flight';
  distance: number; // in kilometers
  date: Date;
  carbonEmission: number; // in kg
  notes?: string;
}

export interface MealData {
  id: string;
  type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'dairy' | 'processed';
  quantity: number; // in servings
  date: Date;
  carbonEmission: number; // in kg
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetEmission: number; // target emission reduction in kg
  currentProgress: number; // current progress in kg
  startDate: Date;
  endDate: Date;
  category: 'transport' | 'food' | 'overall';
  isCompleted: boolean;
}

// Carbon emission factors based on the PDF
export const CARBON_FACTORS = {
  transport: {
    car: 0.16, // kg CO2 per km (average car)
    bus: 0.05, // kg CO2 per km per person
    train: 0.03, // kg CO2 per km per person
    flight: {
      short: 0.18, // kg CO2 per km per person (flights < 1000km)
      medium: 0.13, // kg CO2 per km per person (flights 1000-3700km)
      long: 0.15, // kg CO2 per km per person (flights > 3700km)
    }
  },
  food: {
    vegetarian: 1.4, // kg CO2 per meal
    vegan: 0.9, // kg CO2 per meal
    'non-vegetarian': 3.8, // kg CO2 per meal with meat
    dairy: 1.9, // kg CO2 per serving of dairy products
    processed: 2.5, // kg CO2 per processed food item
  }
};

// Carbon credit types
export interface CarbonCredit {
  id: string;
  name: string;
  projectId: string;
  vintage: string; // Year of issuance
  quantity: number; // in tons of CO2e
  serialNumber: string;
  registry: string; // e.g., Verra, Gold Standard
  status: 'active' | 'retired';
  imageUrl?: string;
  metadata?: {
    description: string;
    location: string;
    sdgs: string[]; // Sustainable Development Goals
    methodology: string;
    verifier: string;
  };
}

export interface CarbonTransaction {
  id: string;
  type: 'purchase' | 'transfer' | 'retirement';
  creditId: string;
  quantity: number;
  date: Date;
  txHash?: string; // Blockchain transaction hash
  counterparty?: string; // Address of the other party
  reason?: string; // Reason for retirement
}