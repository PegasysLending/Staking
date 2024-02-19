import { Signer } from 'ethers';
import {
  PSM_STAKER_PREMIUM,
  COOLDOWN_SECONDS,
  UNSTAKE_WINDOW,
  STAKED_SYS_NAME,
  STAKED_SYS_SYMBOL,
  STAKED_SYS_DECIMALS,
  MAX_UINT_AMOUNT,
} from '../../helpers/constants';
import {
  deployInitializableAdminUpgradeabilityProxy,
  deployPegasysIncentivesController,
  deployStakedPegasys,
  deployMockTransferHook,
  deployStakedPegasysV2,
} from '../../helpers/contracts-accessors';
import { insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { waitForTx } from '../../helpers/misc-utils';
import { eContractid } from '../../helpers/types';
import { MintableErc20 } from '../../types/MintableErc20';

export const testDeployPegasysStakeV1 = async (
  pegasysToken: MintableErc20,
  deployer: Signer,
  vaultOfRewards: Signer,
  restWallets: Signer[]
) => {
  const proxyAdmin = await restWallets[0].getAddress();
  const emissionManager = await deployer.getAddress();

  const stakedToken = pegasysToken.address;
  const rewardsToken = pegasysToken.address;

  const vaultOfRewardsAddress = await vaultOfRewards.getAddress();

  const pegasysIncentivesControllerProxy = await deployInitializableAdminUpgradeabilityProxy();
  const stakedPegasysProxy = await deployInitializableAdminUpgradeabilityProxy();

  const pegasysIncentivesControllerImplementation = await deployPegasysIncentivesController([
    pegasysToken.address,
    vaultOfRewardsAddress,
    stakedPegasysProxy.address,
    PSM_STAKER_PREMIUM,
    emissionManager,
    (1000 * 60 * 60).toString(),
  ]);

  const stakedPegasysImpl = await deployStakedPegasys([
    stakedToken,
    rewardsToken,
    COOLDOWN_SECONDS,
    UNSTAKE_WINDOW,
    vaultOfRewardsAddress,
    emissionManager,
    (1000 * 60 * 60).toString(),
  ]);

  const mockTransferHook = await deployMockTransferHook();

  const stakedPegasysEncodedInitialize = stakedPegasysImpl.interface.encodeFunctionData(
    'initialize',
    [mockTransferHook.address, STAKED_SYS_NAME, STAKED_SYS_SYMBOL, STAKED_SYS_DECIMALS]
  );
  await stakedPegasysProxy['initialize(address,address,bytes)'](
    stakedPegasysImpl.address,
    proxyAdmin,
    stakedPegasysEncodedInitialize
  );
  await waitForTx(
    await pegasysToken.connect(vaultOfRewards).approve(stakedPegasysProxy.address, MAX_UINT_AMOUNT)
  );
  await insertContractAddressInDb(eContractid.StakedPegasys, stakedPegasysProxy.address);

  const peiEncodedInitialize = pegasysIncentivesControllerImplementation.interface.encodeFunctionData(
    'initialize'
  );
  await pegasysIncentivesControllerProxy['initialize(address,address,bytes)'](
    pegasysIncentivesControllerImplementation.address,
    proxyAdmin,
    peiEncodedInitialize
  );
  await waitForTx(
    await pegasysToken
      .connect(vaultOfRewards)
      .approve(pegasysIncentivesControllerProxy.address, MAX_UINT_AMOUNT)
  );
  await insertContractAddressInDb(
    eContractid.PegasysIncentivesController,
    pegasysIncentivesControllerProxy.address
  );

  return {
    pegasysIncentivesControllerProxy,
    stakedPegasysProxy,
  };
};

export const testDeployPegasysStakeV2 = async (
  pegasysToken: MintableErc20,
  deployer: Signer,
  vaultOfRewards: Signer,
  restWallets: Signer[]
) => {
  const stakedToken = pegasysToken.address;
  const rewardsToken = pegasysToken.address;
  const emissionManager = await deployer.getAddress();
  const vaultOfRewardsAddress = await vaultOfRewards.getAddress();

  const { stakedPegasysProxy } = await testDeployPegasysStakeV1(
    pegasysToken,
    deployer,
    vaultOfRewards,
    restWallets
  );

  const stakedPegasysImpl = await deployStakedPegasysV2([
    stakedToken,
    rewardsToken,
    COOLDOWN_SECONDS,
    UNSTAKE_WINDOW,
    vaultOfRewardsAddress,
    emissionManager,
    (1000 * 60 * 60).toString(),
  ]);

  const stakedPegasysEncodedInitialize = stakedPegasysImpl.interface.encodeFunctionData(
    'initialize'
  );

  await stakedPegasysProxy
    .connect(restWallets[0])
    .upgradeToAndCall(stakedPegasysImpl.address, stakedPegasysEncodedInitialize);

  await insertContractAddressInDb(eContractid.StakedPegasysV2, stakedPegasysProxy.address);

  return {
    stakedPegasysProxy,
  };
};
