import type { IBlockchainClient, TransactionReceipt } from '../types.js';
import { SimulationClient } from './SimulationClient.js';

/**
 * AvalancheClient implements IBlockchainClient for the Avalanche C-Chain network.
 * By default, it delegates to the SimulationClient for testing purposes.
 * It is structured so that developers can easily switch to a real Web3 RPC/wallet provider
 * (like ethers, viem, or Privy provider) by uncommenting the real implementation.
 */
export class AvalancheClient implements IBlockchainClient {
  private simulator: SimulationClient;

  constructor() {
    this.simulator = new SimulationClient('Avalanche C-Chain');
  }

  async mintPOAP(
    userAddress: string,
    eventId: string,
    eventTitle: string,
    eventImage: string
  ): Promise<TransactionReceipt> {
    // REAL IMPLEMENTATION BLUEPRINT EXAMPLE (for future Web3 coupling):
    /*
    try {
      // 1. Get the Privy provider (or window.ethereum)
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // 
      // 2. Load the POAP Contract instance
      // const poapContract = new ethers.Contract(contractAddress, poapAbi, signer);
      //
      // 3. Send mint transaction
      // const tx = await poapContract.mint(userAddress, eventId, { gasLimit: 120000 });
      // 
      // 4. Wait for confirmation
      // const receipt = await tx.wait(1);
      // return {
      //   txHash: receipt.transactionHash,
      //   blockNumber: receipt.blockNumber,
      //   contractAddress: poapContract.address,
      //   gasUsed: receipt.gasUsed.toString(),
      //   status: 'success',
      //   chainName: 'Avalanche C-Chain',
      //   tokenId: receipt.events[0].args.tokenId.toString()
      // };
    } catch (e) {
      console.error("Real Avalanche C-Chain Mint Failed", e);
      throw e;
    }
    */

    // Delegate to simulated client for seamless offline/demo mode testing
    return this.simulator.mintPOAP(userAddress, eventId, eventTitle, eventImage);
  }
}
