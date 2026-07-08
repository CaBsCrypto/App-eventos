import type { IBlockchainClient, TransactionReceipt } from '../types.js';

export class SimulationClient implements IBlockchainClient {
  private chainName: string;

  constructor(chainName: string = 'Avalanche C-Chain') {
    this.chainName = chainName;
  }

  private generateHash(prefix: boolean = true): string {
    const chars = '0123456789abcdef';
    let hash = prefix ? '0x' : '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    return prefix ? hash : hash.toUpperCase();
  }

  async mintPOAP(
    userAddress: string,
    eventId: string,
    eventTitle: string,
    eventImage: string
  ): Promise<TransactionReceipt> {
    // Add artificial delay to simulate actual blockchain mining confirmation
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const isEvm = this.chainName.toLowerCase().includes('avalanche') || this.chainName.toLowerCase().includes('polygon');
    
    const txHash = this.generateHash(isEvm);
    const blockNumber = Math.floor(18000000 + Math.random() * 5000000);
    const contractAddress = isEvm 
      ? '0x7bB7000d604b92b6796E25b30E9EF321E535C58c' 
      : 'GBC2E6B4H6ZEX3ZJEXJ3ZJEXJ3ZJEXJ3ZJEXJ3ZJEXJ3ZJEXJ3ZJEXJU'; // Stellar style
    const gasUsed = isEvm ? Math.floor(85000 + Math.random() * 15000).toString() : '100'; // base gas / fee XLM
    const tokenId = `POAP-AVAX-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      txHash,
      blockNumber,
      contractAddress,
      gasUsed,
      status: 'success',
      chainName: this.chainName,
      tokenId
    };
  }
}
