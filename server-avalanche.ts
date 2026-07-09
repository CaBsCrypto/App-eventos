/**
 * Minteo on-chain real en Avalanche Fuji (testnet), server-side.
 *
 * La wallet del PROYECTO (`AVALANCHE_MINTER_PRIVATE_KEY`) es la única que
 * puede acuñar en el contrato `EventProtocolBadge` — paga el gas ella, así
 * el asistente recibe su insignia directo en su dirección sin necesitar AVAX.
 *
 * Gateado: si no hay `AVALANCHE_MINTER_PRIVATE_KEY` + `AVALANCHE_BADGE_CONTRACT`
 * configurados, `isAvalancheMintingEnabled()` es false y el llamador debe usar
 * el fallback simulado — igual patrón que Supabase/Google (nunca rompe local/demo).
 */
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const CHAIN_NAME = 'Avalanche Fuji (Testnet)';
const EXPLORER = 'https://testnet.snowtrace.io';

const MINTER_PK = process.env.AVALANCHE_MINTER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.AVALANCHE_BADGE_CONTRACT;

let cachedAbi: any[] | null = null;
function loadAbi(): any[] {
  if (cachedAbi) return cachedAbi;
  const artifactPath = path.join(process.cwd(), 'contracts/artifacts/EventProtocolBadge.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  cachedAbi = artifact.abi;
  return cachedAbi as any[];
}

export function isAvalancheMintingEnabled(): boolean {
  return Boolean(MINTER_PK && CONTRACT_ADDRESS);
}

export interface MintResult {
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  tokenId: string;
  chainName: string;
  explorerUrl: string;
}

/**
 * Acuña la insignia a `toAddress`. Lanza si el minteo real falla (el llamador
 * decide si eso debe bloquear el flujo o degradarse a simulado).
 */
export async function mintBadgeOnChain(
  toAddress: string,
  eventId: string,
  metadataUri: string,
): Promise<MintResult> {
  if (!isAvalancheMintingEnabled()) {
    throw new Error('Minteo on-chain no configurado (faltan AVALANCHE_MINTER_PRIVATE_KEY / AVALANCHE_BADGE_CONTRACT)');
  }
  const provider = new ethers.JsonRpcProvider(FUJI_RPC);
  const wallet = new ethers.Wallet(MINTER_PK as string, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS as string, loadAbi(), wallet);

  const tx = await contract.mint(toAddress, eventId, metadataUri);
  const receipt = await tx.wait(1);

  // El evento BadgeMinted(to, tokenId, eventId) trae el tokenId real acuñado.
  const mintedEvent = receipt.logs
    .map((l: any) => { try { return contract.interface.parseLog(l); } catch { return null; } })
    .find((e: any) => e && e.name === 'BadgeMinted');
  const tokenId = mintedEvent ? mintedEvent.args.tokenId.toString() : '0';

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    contractAddress: CONTRACT_ADDRESS as string,
    tokenId,
    chainName: CHAIN_NAME,
    explorerUrl: `${EXPLORER}/tx/${receipt.hash}`,
  };
}
