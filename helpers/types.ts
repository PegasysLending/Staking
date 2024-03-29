import BigNumber from 'bignumber.js';

export enum eEthereumNetwork {
  coverage = 'coverage',
  hardhat = 'hardhat',
  kovan = 'kovan',
  ropsten = 'ropsten',
  rinkeby = 'rinkeby',
  xdai = 'xdai',
  main = 'main',
}

export enum eContractid {
  DistributionManager = 'DistributionManager',
  StakedPegasys = 'StakedPegasys',
  StakedPegasysImpl = 'StakedPegasysImpl',
  PegasysIncentivesController = 'PegasysIncentivesController',
  IERC20Detailed = 'IERC20Detailed',
  AdminUpgradeabilityProxy = 'AdminUpgradeabilityProxy',
  InitializableAdminUpgradeabilityProxy = 'InitializableAdminUpgradeabilityProxy',
  MintableErc20 = 'MintableErc20',
  LendingPoolMock = 'LendingPoolMock',
  MockTransferHook = 'MockTransferHook',
  ATokenMock = 'ATokenMock',
  StakedPegasysV2 = 'StakedPegasysV2',
  DoubleTransferHelper = 'DoubleTransferHelper',
  ICRPFactory = 'ICRPFactory',
  StakedTokenV2 = 'StakedTokenV2',
  StakedTokenV3 = 'StakedTokenV3',
  IConfigurableRightsPool = 'IConfigurableRightsPool',
  IBPool = 'IBPool',
  IControllerPegasysEcosystemReserve = 'IControllerPegasysEcosystemReserve',
  MockSelfDestruct = 'SelfdestructTransfer',
}

export type tEthereumAddress = string;
export type tStringTokenBigUnits = string; // 1 ETH, or 10e6 USDC or 10e18 DAI
export type tBigNumberTokenBigUnits = BigNumber;
// 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI
export type tStringTokenSmallUnits = string;
export type tBigNumberTokenSmallUnits = BigNumber;

export interface iParamsPerNetwork<T> {
  [eEthereumNetwork.coverage]: T;
  [eEthereumNetwork.hardhat]: T;
  [eEthereumNetwork.kovan]: T;
  [eEthereumNetwork.ropsten]: T;
  [eEthereumNetwork.rinkeby]: T;
  [eEthereumNetwork.xdai]: T;
  [eEthereumNetwork.main]: T;
}
