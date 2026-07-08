export interface TransactionReceipt {
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  gasUsed: string;
  status: 'success' | 'failed';
  chainName: string;
  tokenId: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface IBlockchainClient {
  mintPOAP(
    userAddress: string,
    eventId: string,
    eventTitle: string,
    eventImage: string
  ): Promise<TransactionReceipt>;
}
