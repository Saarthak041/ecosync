import carbonCreditService, { CarbonCredit, CarbonTransaction } from '../services/carbonCreditService';

// Mock data for testing purposes
export const mockCarbonCredits: CarbonCredit[] = [
  {
    id: '1',
    tokenId: 1,
    name: 'Amazon Rainforest Protection - 2024',
    projectId: 'AMZN-001',
    vintage: '2024',
    quantity: 100,
    currentBalance: 75,
    serialNumber: 'SN001-2024-AMZN',
    registry: 'Verra VCS',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
    issuer: '0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91',
    issuanceDate: new Date('2024-01-15'),
    metadataURI: 'QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    metadata: {
      description: 'Carbon credits from Amazon rainforest conservation project',
      location: 'Amazon Basin, Brazil',
      sdgs: ['13', '15'],
      methodology: 'REDD+',
      verifier: 'TÜV SÜD',
      projectType: 'Forest Conservation',
      additionalDocuments: ['verification_report.pdf', 'project_document.pdf']
    }
  },
  {
    id: '2',
    tokenId: 2,
    name: 'Wind Farm Carbon Credits - 2024',
    projectId: 'WIND-002',
    vintage: '2024',
    quantity: 50,
    currentBalance: 50,
    serialNumber: 'SN002-2024-WIND',
    registry: 'Gold Standard',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500',
    issuer: '0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91',
    issuanceDate: new Date('2024-02-20'),
    metadataURI: 'QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    metadata: {
      description: 'Renewable energy carbon credits from offshore wind farm',
      location: 'North Sea, Denmark',
      sdgs: ['7', '13'],
      methodology: 'ACM0002',
      verifier: 'DNV GL',
      projectType: 'Renewable Energy',
      additionalDocuments: ['monitoring_report.pdf']
    }
  },
  {
    id: '3',
    tokenId: 3,
    name: 'Solar Power Project - 2023',
    projectId: 'SOLAR-003',
    vintage: '2023',
    quantity: 25,
    currentBalance: 0,
    serialNumber: 'SN003-2023-SOLAR',
    registry: 'Climate Action Reserve',
    status: 'retired',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500',
    issuer: '0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91',
    issuanceDate: new Date('2023-12-10'),
    metadataURI: 'QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
    metadata: {
      description: 'Solar photovoltaic carbon offset project',
      location: 'Rajasthan, India',
      sdgs: ['7', '13'],
      methodology: 'AMS-I.D',
      verifier: 'Bureau Veritas',
      projectType: 'Solar Energy',
    }
  }
];

export const mockTransactions: CarbonTransaction[] = [
  {
    id: 'tx1',
    type: 'issuance',
    creditId: '1',
    tokenId: 1,
    quantity: 100,
    date: new Date('2024-01-15'),
    txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    to: '0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91',
    status: 'confirmed',
    gasUsed: '85000',
    gasPrice: '30'
  },
  {
    id: 'tx2',
    type: 'transfer',
    creditId: '1',
    tokenId: 1,
    quantity: 25,
    date: new Date('2024-03-10'),
    txHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    from: '0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91',
    to: '0x123456789012345678901234567890123456789012',
    status: 'confirmed',
    gasUsed: '45000',
    gasPrice: '25'
  },
  {
    id: 'tx3',
    type: 'retirement',
    creditId: '3',
    tokenId: 3,
    quantity: 25,
    date: new Date('2024-07-20'),
    txHash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    reason: 'Corporate carbon neutrality offset',
    status: 'confirmed',
    gasUsed: '65000',
    gasPrice: '28'
  }
];

// Override the service methods to use mock data for testing
export const initializeMockData = () => {
  // Override getUserCredits method
  const originalGetUserCredits = carbonCreditService.getUserCredits;
  carbonCreditService.getUserCredits = async (address: string) => {
    console.log('Using mock data for getUserCredits');
    return Promise.resolve(mockCarbonCredits);
  };

  // Override getUserTransactions method
  const originalGetUserTransactions = carbonCreditService.getUserTransactions;
  carbonCreditService.getUserTransactions = async (address: string) => {
    console.log('Using mock data for getUserTransactions');
    return Promise.resolve(mockTransactions);
  };

  // Override transferCredits method
  const originalTransferCredits = carbonCreditService.transferCredits;
  carbonCreditService.transferCredits = async (to: string, tokenId: number, quantity: number) => {
    console.log('Mock transfer:', { to, tokenId, quantity });
    return Promise.resolve('0xmock_transfer_hash_' + Date.now());
  };

  // Override retireCredits method
  const originalRetireCredits = carbonCreditService.retireCredits;
  carbonCreditService.retireCredits = async (tokenId: number, quantity: number, reason: string) => {
    console.log('Mock retirement:', { tokenId, quantity, reason });
    return Promise.resolve('0xmock_retirement_hash_' + Date.now());
  };

  console.log('✅ Mock data initialized for testing');
  
  return {
    restoreOriginal: () => {
      carbonCreditService.getUserCredits = originalGetUserCredits;
      carbonCreditService.getUserTransactions = originalGetUserTransactions;
      carbonCreditService.transferCredits = originalTransferCredits;
      carbonCreditService.retireCredits = originalRetireCredits;
      console.log('✅ Original methods restored');
    }
  };
};
