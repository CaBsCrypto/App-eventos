/**
 * Deploy de EventProtocolBadge a Avalanche Fuji (testnet).
 * Uso: DEPLOYER_PRIVATE_KEY=0x... node scripts/deploy-contract.cjs
 */
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error('Falta DEPLOYER_PRIVATE_KEY en el entorno');

  const artifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../contracts/artifacts/EventProtocolBadge.json'), 'utf8'),
  );

  const provider = new ethers.JsonRpcProvider(FUJI_RPC);
  const wallet = new ethers.Wallet(pk, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log('Deployer:', wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'AVAX');
  if (balance === 0n) throw new Error('Sin fondos. Pedí AVAX de testnet al faucet primero.');

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log('Desplegando...');
  const contract = await factory.deploy(wallet.address); // minter = la propia wallet del proyecto
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('✅ Contrato desplegado en:', address);
  console.log('   Explorer:', `https://testnet.snowtrace.io/address/${address}`);

  fs.writeFileSync(
    path.join(__dirname, '../contracts/artifacts/deployment.json'),
    JSON.stringify({ address, network: 'avalanche-fuji', chainId: 43113, minter: wallet.address, deployedAt: new Date().toISOString() }, null, 2),
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
