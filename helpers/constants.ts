import { eEthereumNetwork, tEthereumAddress } from './types';
import { getParamPerNetwork } from './misc-utils';

export const MAX_UINT_AMOUNT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const MOCK_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const WAD = Math.pow(10, 18).toString();
export const COOLDOWN_SECONDS = '3600'; // 1 hour in seconds
export const UNSTAKE_WINDOW = '1800'; // 30 min in seconds
export const DISTRIBUTION_DURATION = '86400'; // 1 day in seconds

export const STAKED_AAVE_NAME = 'Staked ROLLUXLending';
export const STAKED_AAVE_SYMBOL = 'stkROLLUXL';
export const STAKED_AAVE_DECIMALS = 18;

export const AAVE_GOVERNANCE_V2 = '0x5Dda19AC38b19788A7842819d6673034006090E1';
export const UPGRADABLE_CRP_FACTORY = '0x260f40acd8F842BeE68D3D9626bD9EE7419Abd70'; //'0x1156C30b08DbF16281c803EAe0d52Eee7652f10C'
export const AAVE_TOKEN = '0x325de67D58CB7CE6a51c9Fd3A9Fc4a0C8361Fd2b'; //TODO TTC4
export const WETH = '0xDde20Eae889e5d572eD6a271ee3C30f1a6E8795f';
export const REWARDS_VAULT = '0x5Dda19AC38b19788A7842819d6673034006090E1'; //'0x25f2226b597e8f9514b3f68f00f494cf4f286491'
export const BPOOL_FACTORY = '0x7D8F4A741196603e2B53dbA7Ae34F03f5Ef85f95';

export const CRP_IMPLEMENTATION = '0x7D8F4A741196603e2B53dbA7Ae34F03f5Ef85f95';
export const SHORT_EXECUTOR = '0x7D8F4A741196603e2B53dbA7Ae34F03f5Ef85f95';
export const LONG_EXECUTOR = '0x61910EcD7e8e942136CE7Fe7943f956cea1CC2f7';
export const PROXY_CRP_ADMIN = SHORT_EXECUTOR;
export const RESERVE_CONTROLER = '0x5Dda19AC38b19788A7842819d6673034006090E1';
export const ZERO_ADDRESS: tEthereumAddress = '0x0000000000000000000000000000000000000000';

// PEI constants
export const PSM_STAKER_PREMIUM = '2';

// just junk mock

export const RANDOM_ADDRESSES = [
  '0x0000000000000000000000000000000000000221',
  '0x0000000000000000000000000000000000000321',
  '0x0000000000000000000000000000000000000211',
  '0x0000000000000000000000000000000000000251',
  '0x0000000000000000000000000000000000000271',
  '0x0000000000000000000000000000000000000291',
  '0x0000000000000000000000000000000000000321',
  '0x0000000000000000000000000000000000000421',
  '0x0000000000000000000000000000000000000521',
  '0x0000000000000000000000000000000000000621',
  '0x0000000000000000000000000000000000000721',
];

export const getAaveTokenPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: '',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.rinkeby]: '0x838341c70E1f02382AdA5e867DA7E5EC85fC47b7',
      [eEthereumNetwork.xdai]: '0x3a97704a1b25F08aa230ae53B352e2e72ef52843',
      [eEthereumNetwork.main]: '0x325de67D58CB7CE6a51c9Fd3A9Fc4a0C8361Fd2b', //TODO
    },
    network
  );

export const getCooldownSecondsPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<string>(
    {
      [eEthereumNetwork.coverage]: COOLDOWN_SECONDS,
      [eEthereumNetwork.hardhat]: COOLDOWN_SECONDS,
      [eEthereumNetwork.kovan]: '21600', // 8h
      [eEthereumNetwork.ropsten]: '180', // 3m
      [eEthereumNetwork.rinkeby]: '180', // 3m
      [eEthereumNetwork.xdai]: '864000', // 10d
      [eEthereumNetwork.main]: '864000', // 10d
    },
    network
  );

export const getUnstakeWindowPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<string>(
    {
      [eEthereumNetwork.coverage]: UNSTAKE_WINDOW,
      [eEthereumNetwork.hardhat]: UNSTAKE_WINDOW,
      [eEthereumNetwork.kovan]: '10800', // 4h
      [eEthereumNetwork.ropsten]: '240', // 4m
      [eEthereumNetwork.rinkeby]: '240', // 4m
      [eEthereumNetwork.xdai]: '172800', // 2d
      [eEthereumNetwork.main]: '172800', // 2d
    },
    network
  );

export const getAaveAdminPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: '', // Aave Governance
      [eEthereumNetwork.ropsten]: '', // Aave Governance
      [eEthereumNetwork.rinkeby]: '0x32b1ca2182eE26F8c5A6CB6Ed285Ef3304a4F5BE', // Rinkeby Agave Deployer
      [eEthereumNetwork.xdai]: '0xd811a03EEb2623556bf05bcD7F58874D2d784C26', // Agave DAO Agent
      [eEthereumNetwork.main]: '0x5Dda19AC38b19788A7842819d6673034006090E1', // Aave Governance
    },
    network
  );

export const getDistributionDurationPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: DISTRIBUTION_DURATION,
      [eEthereumNetwork.hardhat]: DISTRIBUTION_DURATION,
      [eEthereumNetwork.kovan]: '864000',
      [eEthereumNetwork.ropsten]: '864000',
      [eEthereumNetwork.rinkeby]: '432000', // 5 days
      [eEthereumNetwork.xdai]: '16300000', // Number of seconds from deploy time until Nov 15 2021
      [eEthereumNetwork.main]: '16300000', // 5 months (30 days) in seconds
    },
    network
  );

export const getAaveIncentivesVaultPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: '',
      [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: '',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.rinkeby]: '0x2d206Fd0C7c76016234810232159b05562608A42',
      [eEthereumNetwork.xdai]: '0x70225281599Ba586039E7BD52736681DFf6c2Fc4',
      [eEthereumNetwork.main]: '0x5Dda19AC38b19788A7842819d6673034006090E1',
    },
    network
  );
