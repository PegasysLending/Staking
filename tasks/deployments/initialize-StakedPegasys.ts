import { task } from 'hardhat/config';
import { eContractid } from '../../helpers/types';
import { waitForTx } from '../../helpers/misc-utils';
import {
  ZERO_ADDRESS,
  STAKED_SYS_NAME,
  STAKED_SYS_SYMBOL,
  STAKED_SYS_DECIMALS,
} from '../../helpers/constants';
import {
  getStakedPegasys,
  getStakedPegasysImpl,
  getStakedPegasysProxy,
} from '../../helpers/contracts-accessors';

const { StakedPegasys } = eContractid;

task(`initialize-${StakedPegasys}`, `Initialize the ${StakedPegasys} proxy contract`)
  .addParam(
    'admin',
    `The address to be added as an Admin role in ${StakedPegasys} Transparent Proxy.`
  )
  .setAction(async ({ admin: pegasysAdmin }, localBRE) => {
    await localBRE.run('set-dre');

    if (!pegasysAdmin) {
      throw new Error(
        `Missing --admin parameter to add the Admin Role to ${StakedPegasys} Transparent Proxy`
      );
    }

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    console.log(`\n- ${StakedPegasys} initialization`);

    const stakedPegasysImpl = await getStakedPegasysImpl();
    const stakedPegasysProxy = await getStakedPegasysProxy();

    console.log('\tInitializing StakedPegasys');

    const encodedInitializeStakedPegasys = stakedPegasysImpl.interface.encodeFunctionData(
      'initialize',
      [ZERO_ADDRESS, STAKED_SYS_NAME, STAKED_SYS_SYMBOL, STAKED_SYS_DECIMALS]
    );

    await waitForTx(
      await stakedPegasysProxy.functions['initialize(address,address,bytes)'](
        stakedPegasysImpl.address,
        pegasysAdmin,
        encodedInitializeStakedPegasys
      )
    );

    console.log('\tFinished Pegasys Token and Transparent Proxy initialization');
  });
