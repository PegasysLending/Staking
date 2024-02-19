import { task } from 'hardhat/config';
import { eContractid } from '../../helpers/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { StakedPegasys } from '../../types/StakedPegasys';

task('dev-deployment', 'Deployment in hardhat').setAction(async (_, localBRE) => {
  const DRE: HardhatRuntimeEnvironment = await localBRE.run('set-dre');

  const pegasysStake = (await DRE.run(`deploy-${eContractid.StakedPegasys}`)) as StakedPegasys;
});
