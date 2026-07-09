const fs = require('fs');
const path = require('path');
const solc = require('solc');

const source = fs.readFileSync(path.join(__dirname, '../contracts/EventProtocolBadge.sol'), 'utf8');

const input = {
  language: 'Solidity',
  sources: { 'EventProtocolBadge.sol': { content: source } },
  settings: {
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    optimizer: { enabled: true, runs: 200 },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const fatal = output.errors.filter((e) => e.severity === 'error');
  output.errors.forEach((e) => console.error(e.formattedMessage));
  if (fatal.length) process.exit(1);
}

const contract = output.contracts['EventProtocolBadge.sol']['EventProtocolBadge'];
const artifact = {
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
};

const outDir = path.join(__dirname, '../contracts/artifacts');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'EventProtocolBadge.json'), JSON.stringify(artifact, null, 2));
console.log('Compiled OK. Bytecode length:', contract.evm.bytecode.object.length);
