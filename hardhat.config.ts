import { HardhatUserConfig } from 'hardhat/config';
import { eEthereumNetwork } from './helpers/types';
// @ts-ignore
import { accounts } from './test-wallets';
require('dotenv').config();

import 'hardhat-typechain';
import 'solidity-coverage';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import path from 'path';
import fs from 'fs';

export const BUIDLEREVM_CHAIN_ID = 31337;

const DEFAULT_BLOCK_GAS_LIMIT = 125000;
const DEFAULT_GAS_PRICE = 100 * 1000 * 1000; // 75 gwei
const HARDFORK = 'istanbul';
const INFURA_KEY = process.env.INFURA_KEY || '';
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || '';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const MNEMONIC = process.env.MNEMONIC || '';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';
const FORKING_BLOCK = parseInt(process.env.FORKING_BLOCK || '11633164');

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

require(`${path.join(__dirname, 'tasks/misc')}/set-dre.ts`);

const mainnetFork = MAINNET_FORK
  ? {
      blockNumber: FORKING_BLOCK,
      url: ALCHEMY_KEY
        ? `https://rpc-tanenbaum.rollux.com`
        : `https://rpc-tanenbaum.rollux.com`,
    }
  : undefined;

const getCommonNetworkConfig = (networkName: eEthereumNetwork, networkId: number) => {
  return {
    url: ALCHEMY_KEY
      ? `https://rpc-tanenbaum.rollux.com`
      : `https://rpc-tanenbaum.rollux.com`,
    hardfork: HARDFORK,
    chainId: 57000,
    accounts: {
      mnemonic: MNEMONIC,//"// TODO: ADD mnemonic",
      path: MNEMONIC_PATH,
      initialIndex: 0,
      count: 20,
    },
  };
};

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
    ],
  },
  typechain: {
    outDir: 'types',
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY,
  },
  defaultNetwork: 'hardhat',
  mocha: {
    timeout: 0,
  },
  networks: {
    kovan: getCommonNetworkConfig(eEthereumNetwork.kovan, 42),
    rinkeby: { 
      ...getCommonNetworkConfig(eEthereumNetwork.rinkeby, 4),
      gasPrice: 1000000000,
      blockGasLimit: 10000000,
      url: 'http://rinkeby:8558/'
    },
    ropsten: getCommonNetworkConfig(eEthereumNetwork.ropsten, 3),
    xdai: { 
      ...getCommonNetworkConfig(eEthereumNetwork.xdai, 100),
      gasPrice: 1000000000,
      url: 'http://xdai:8545/'
    },
    main: {
      ...getCommonNetworkConfig(eEthereumNetwork.main, 57000),
      gasPrice: 1000000000,
      url: 'https://rpc-tanenbaum.rollux.com'
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
      forking: mainnetFork,
    },
    ganache: {
      url: 'http://ganache:8545',
      accounts: {
        mnemonic: 'fox sight canyon orphan hotel grow hedgehog build bless august weather swarm',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
    coverage: {
      url: 'http://localhost:8555',
    },
  },
};

export default config;
