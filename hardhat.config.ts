import { HardhatUserConfig } from 'hardhat/config';
import { eEthereumNetwork } from './helpers/types';
// @ts-ignore
import { accounts } from './test-wallets';
require('dotenv').config();

import 'hardhat-typechain';
import 'solidity-coverage';
import '@nomiclabs/hardhat-waffle';
import '@nomicfoundation/hardhat-verify';
import path from 'path';
import fs from 'fs';

export const BUIDLEREVM_CHAIN_ID = 31337;

const DEFAULT_BLOCK_GAS_LIMIT = 12500000;
const DEFAULT_GAS_PRICE = 100 * 1000 * 1000; // 75 gwei
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';
const FORKING_BLOCK = parseInt(process.env.FORKING_BLOCK || '11633164');
const ANKR_API_KEY = process.env.ANKR_API_KEY;
const ROLLUX_TANENBAUM_URL = process.env.ROLLUX_TANENBAUM_URL;
const MNEMONIC = process.env.MNEMONIC;

// Prevent to load scripts before compilation and typechain
if (!SKIP_LOAD) {
  ['misc', 'migrations', 'deployments'].forEach((folder) => {
    const tasksPath = path.join(__dirname, 'tasks', folder);
    fs.readdirSync(tasksPath)
      .filter((pth) => pth.includes('.ts'))
      .forEach((task) => {
        require(`${tasksPath}/${task}`);
      });
  });
}

/*This will default to ROLLUX_TANENBAUM_URL if
   you do not specify ANKR_API_KEY in .env */
const rolluxTanenbaumUrl = ANKR_API_KEY
  ? `https://rpc.ankr.com/rollux_testnet/${ANKR_API_KEY}`
  : ROLLUX_TANENBAUM_URL;

require(`${path.join(__dirname, 'tasks/misc')}/set-dre.ts`);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.6.12',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
      {
        version: '0.7.5',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
      {
        version: '0.8.0',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'istanbul',
        },
      },
    ],
  },
  typechain: {
    outDir: 'types',
  },
  etherscan: {
    apiKey: {
      main: 'abc', // Set to an empty string or some placeholder
    },
    customChains: [
      {
        network: 'main',
        chainId: 57000,
        urls: {
          apiURL: 'https://rollux.tanenbaum.io/api',
          browserURL: 'https://rollux.tanenbaum.io/',
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
  mocha: {
    timeout: 0,
  },
  networks: {
    main: {
      chainId: 57000,
      url: 'https://rpc-tanenbaum.rollux.com',
      accounts: [PRIVATE_KEY],
    },
    'rollux-tanenbaum': {
      url: rolluxTanenbaumUrl,
      chainId: 57000,
      accounts: { mnemonic: MNEMONIC },
    },
    hardhat: {
      hardfork: 'istanbul',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: DEFAULT_GAS_PRICE,
      chainId: BUIDLEREVM_CHAIN_ID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
    },
  },
};

export default config;
