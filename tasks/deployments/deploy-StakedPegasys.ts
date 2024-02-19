import { task } from 'hardhat/config';

import { eContractid, eEthereumNetwork, tEthereumAddress } from '../../helpers/types';
import { registerContractInJsonDb } from '../../helpers/contracts-helpers';
import {
  getPegasysTokenPerNetwork,
  getCooldownSecondsPerNetwork,
  getUnstakeWindowPerNetwork,
  getPegasysAdminPerNetwork,
  getDistributionDurationPerNetwork,
  getPegasysIncentivesVaultPerNetwork,
} from '../../helpers/constants';
import {
  deployStakedPegasys,
  deployInitializableAdminUpgradeabilityProxy,
} from '../../helpers/contracts-accessors';
import { checkVerification } from '../../helpers/etherscan-verification';

const { StakedPegasys, StakedPegasysImpl } = eContractid;

task(`deploy-${StakedPegasys}`, `Deploys the ${StakedPegasys} contract`)
  .addFlag('verify', 'Verify StakedPegasys contract via Etherscan API.')
  .addOptionalParam(
    'vaultAddress',
    'Use PegasysIncentivesVault address by param instead of configuration.'
  )
  .addOptionalParam('pegasysAddress', 'Use PegasysToken address by param instead of configuration.')
  .setAction(async ({ verify, vaultAddress, pegasysAddress }, localBRE) => {
    await localBRE.run('set-dre');

    // If Etherscan verification is enabled, check needed enviroments to prevent loss of gas in failed deployments.
    if (verify) {
      checkVerification();
    }

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    const network = localBRE.network.name as eEthereumNetwork;

    console.log(`\n- ${StakedPegasys} deployment`);

    console.log(`\tDeploying ${StakedPegasys} implementation ...`);
    // console.log(getPegasysTokenPerNetwork(network), getCooldownSecondsPerNetwork(network), getUnstakeWindowPerNetwork(network), getPegasysIncentivesVaultPerNetwork(network), getDistributionDurationPerNetwork(network));
    console.log(localBRE.network);

    const stakedPegasysImpl = await deployStakedPegasys(
      [
        pegasysAddress || getPegasysTokenPerNetwork(network),
        pegasysAddress || getPegasysTokenPerNetwork(network),
        getCooldownSecondsPerNetwork(network),
        getUnstakeWindowPerNetwork(network),
        vaultAddress || getPegasysIncentivesVaultPerNetwork(network),
        // We can't use the PegasysAdmin here because we're using it as the proxy admin,
        // and the proxy admin can't call the proxied-to contract
        // The vault will be fine, since it's what's paying the bills anyway
        vaultAddress || getPegasysIncentivesVaultPerNetwork(network), //getPegasysAdminPerNetwork(network),
        getDistributionDurationPerNetwork(network),
      ],
      false // disable verify due not supported by current buidler etherscan plugin
    );
    await stakedPegasysImpl.deployTransaction.wait();
    await registerContractInJsonDb(StakedPegasysImpl, stakedPegasysImpl);

    console.log(`\tDeploying ${StakedPegasys} Transparent Proxy ...`);
    const stakedPegasysProxy = await deployInitializableAdminUpgradeabilityProxy(verify);
    await registerContractInJsonDb(StakedPegasys, stakedPegasysProxy);

    console.log(`\tFinished ${StakedPegasys} proxy and implementation deployment`);
  });
