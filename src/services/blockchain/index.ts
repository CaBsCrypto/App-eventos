import type { IBlockchainClient, TransactionReceipt, NetworkConfig } from './types.js';
import { AvalancheClient } from './clients/AvalancheClient.js';
import { SimulationClient } from './clients/SimulationClient.js';

export const NETWORKS: Record<string, NetworkConfig> = {
  avalanche: {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 }
  },
  polygon: {
    name: 'Polygon PoS',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 }
  },
  stellar: {
    name: 'Stellar Mainnet',
    chainId: 1, // Stellar doesn't use EVM chain IDs, but keep placeholder
    rpcUrl: 'https://horizon.stellar.org',
    blockExplorerUrl: 'https://stellar.expert/explorer/public',
    nativeCurrency: { name: 'Lumen', symbol: 'XLM', decimals: 7 }
  }
};

let currentNetworkKey = 'avalanche'; // Default to Avalanche

export function getActiveNetwork(): NetworkConfig {
  return NETWORKS[currentNetworkKey];
}

export function setActiveNetwork(networkKey: 'avalanche' | 'polygon' | 'stellar') {
  if (NETWORKS[networkKey]) {
    currentNetworkKey = networkKey;
  }
}

export function getActiveClient(): IBlockchainClient {
  switch (currentNetworkKey) {
    case 'avalanche':
      return new AvalancheClient();
    case 'polygon':
      return new SimulationClient('Polygon PoS');
    case 'stellar':
      return new SimulationClient('Stellar Mainnet');
    default:
      return new AvalancheClient();
  }
}

export async function mintPOAPForEvent(
  userAddress: string,
  eventId: string,
  eventTitle: string,
  eventImage: string
): Promise<TransactionReceipt> {
  const client = getActiveClient();
  return client.mintPOAP(userAddress, eventId, eventTitle, eventImage);
}

export type { IBlockchainClient, TransactionReceipt, NetworkConfig };
