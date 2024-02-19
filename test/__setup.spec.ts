import rawBRE from 'hardhat';
import { Signer, ethers } from 'ethers';
import { getEthersSigners } from '../helpers/contracts-helpers';
import { initializeMakeSuite } from './helpers/make-suite';
import { deployMintableErc20, deployATokenMock } from '../helpers/contracts-accessors';
import { waitForTx } from '../helpers/misc-utils';
import { MintableErc20 } from '../types/MintableErc20';
import { testDeployPegasysStakeV2, testDeployPegasysStakeV1 } from './helpers/deploy';

const topUpWalletsWithPegasys = async (
  wallets: Signer[],
  pegasysToken: MintableErc20,
  amount: string
) => {
  for (const wallet of wallets) {
    await waitForTx(await pegasysToken.connect(wallet).mint(amount));
  }
};

const buildTestEnv = async (deployer: Signer, vaultOfRewards: Signer, restWallets: Signer[]) => {
  console.time('setup');

  const pegasysToken = await deployMintableErc20(['Pegasys', 'pegasys', 18]);

  await waitForTx(
    await pegasysToken.connect(vaultOfRewards).mint(ethers.utils.parseEther('1000000'))
  );
  await topUpWalletsWithPegasys(
    [
      restWallets[0],
      restWallets[1],
      restWallets[2],
      restWallets[3],
      restWallets[4],
      restWallets[5],
    ],
    pegasysToken,
    ethers.utils.parseEther('100').toString()
  );

  await testDeployPegasysStakeV2(pegasysToken, deployer, vaultOfRewards, restWallets);

  const { pegasysIncentivesControllerProxy } = await testDeployPegasysStakeV1(
    pegasysToken,
    deployer,
    vaultOfRewards,
    restWallets
  );

  await deployATokenMock(pegasysIncentivesControllerProxy.address, 'aDai');
  await deployATokenMock(pegasysIncentivesControllerProxy.address, 'aWeth');

  console.timeEnd('setup');
};

before(async () => {
  await rawBRE.run('set-dre');
  const [deployer, rewardsVault, ...restWallets] = await getEthersSigners();
  console.log('-> Deploying test environment...');
  await buildTestEnv(deployer, rewardsVault, restWallets);
  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
});
