import { makeSuite, TestEnv } from '../helpers/make-suite';
import {
  COOLDOWN_SECONDS,
  UNSTAKE_WINDOW,
  MAX_UINT_AMOUNT,
  STAKED_SYS_NAME,
  STAKED_SYS_SYMBOL,
  STAKED_SYS_DECIMALS,
} from '../../helpers/constants';
import { waitForTx, timeLatest, advanceBlock, increaseTimeAndMine } from '../../helpers/misc-utils';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { compareRewardsAtAction } from './data-helpers/reward';
import { getUserIndex } from '../DistributionManager/data-helpers/asset-user-data';
import { getRewards } from '../DistributionManager/data-helpers/base-math';
import { logPegasysTokenBalanceOf } from './data-helpers/loggers';

const { expect } = require('chai');

makeSuite('StakedPegasys V2. Basics', (testEnv: TestEnv) => {
  it('Initial configuration after initialize() is correct', async () => {
    const { stakedPegasysV2, pegasysToken, rewardsVault } = testEnv;

    expect(await stakedPegasysV2.name()).to.be.equal(STAKED_SYS_NAME);
    expect(await stakedPegasysV2.symbol()).to.be.equal(STAKED_SYS_SYMBOL);
    expect(await stakedPegasysV2.decimals()).to.be.equal(STAKED_SYS_DECIMALS);
    expect(await stakedPegasysV2.REVISION()).to.be.equal(2);
    expect(await stakedPegasysV2.STAKED_TOKEN()).to.be.equal(pegasysToken.address);
    expect(await stakedPegasysV2.REWARD_TOKEN()).to.be.equal(pegasysToken.address);
    expect((await stakedPegasysV2.COOLDOWN_SECONDS()).toString()).to.be.equal(COOLDOWN_SECONDS);
    expect((await stakedPegasysV2.UNSTAKE_WINDOW()).toString()).to.be.equal(UNSTAKE_WINDOW);
    expect(await stakedPegasysV2.REWARDS_VAULT()).to.be.equal(rewardsVault.address);
  });

  it('Reverts trying to stake 0 amount', async () => {
    const {
      stakedPegasysV2,
      users: [, staker],
    } = testEnv;
    const amount = '0';

    await expect(
      stakedPegasysV2.connect(staker.signer).stake(staker.address, amount)
    ).to.be.revertedWith('INVALID_ZERO_AMOUNT');
  });

  it('Reverts trying to activate cooldown with 0 staked amount', async () => {
    const {
      stakedPegasysV2,
      users: [, staker],
    } = testEnv;
    const amount = '0';

    await expect(stakedPegasysV2.connect(staker.signer).cooldown()).to.be.revertedWith(
      'INVALID_BALANCE_ON_COOLDOWN'
    );
  });

  it('User 1 stakes 50 SYS: receives 50 SSYS, StakedPegasys balance of SYS is 50 and his rewards to claim are 0', async () => {
    const {
      stakedPegasysV2,
      pegasysToken,
      users: [, staker],
    } = testEnv;
    const amount = ethers.utils.parseEther('50');

    const saveBalanceBefore = new BigNumber(
      (await stakedPegasysV2.balanceOf(staker.address)).toString()
    );

    // Prepare actions for the test case
    const actions = () => [
      pegasysToken.connect(staker.signer).approve(stakedPegasysV2.address, amount),
      stakedPegasysV2.connect(staker.signer).stake(staker.address, amount),
    ];

    // Check rewards
    await compareRewardsAtAction(stakedPegasysV2, staker.address, actions);

    // Stake token tests
    expect((await stakedPegasysV2.balanceOf(staker.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
    expect((await pegasysToken.balanceOf(stakedPegasysV2.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
    expect((await stakedPegasysV2.balanceOf(staker.address)).toString()).to.be.equal(amount);
    expect((await pegasysToken.balanceOf(stakedPegasysV2.address)).toString()).to.be.equal(amount);
  });

  it('User 1 stakes 20 SYS more: his total SSYS balance increases, StakedPegasys balance of Pegasys increases and his reward until now get accumulated', async () => {
    const {
      stakedPegasysV2,
      pegasysToken,
      users: [, staker],
    } = testEnv;
    const amount = ethers.utils.parseEther('20');

    const saveBalanceBefore = new BigNumber(
      (await stakedPegasysV2.balanceOf(staker.address)).toString()
    );
    const actions = () => [
      pegasysToken.connect(staker.signer).approve(stakedPegasysV2.address, amount),
      stakedPegasysV2.connect(staker.signer).stake(staker.address, amount),
    ];

    // Checks rewards
    await compareRewardsAtAction(stakedPegasysV2, staker.address, actions, true);

    // Extra test checks
    expect((await stakedPegasysV2.balanceOf(staker.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
    expect((await pegasysToken.balanceOf(stakedPegasysV2.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
  });

  it('User 1 claim half rewards ', async () => {
    const {
      stakedPegasysV2,
      pegasysToken,
      users: [, staker],
    } = testEnv;
    // Increase time for bigger rewards
    await increaseTimeAndMine(1000);

    const halfRewards = (await stakedPegasysV2.stakerRewardsToClaim(staker.address)).div(2);
    const saveUserBalance = await pegasysToken.balanceOf(staker.address);

    await stakedPegasysV2.connect(staker.signer).claimRewards(staker.address, halfRewards);

    const userBalanceAfterActions = await pegasysToken.balanceOf(staker.address);
    expect(userBalanceAfterActions.eq(saveUserBalance.add(halfRewards))).to.be.ok;
  });

  it('User 1 tries to claim higher reward than current rewards balance', async () => {
    const {
      stakedPegasysV2,
      pegasysToken,
      users: [, staker],
    } = testEnv;

    const saveUserBalance = await pegasysToken.balanceOf(staker.address);

    // Try to claim more amount than accumulated
    await expect(
      stakedPegasysV2
        .connect(staker.signer)
        .claimRewards(staker.address, ethers.utils.parseEther('10000'))
    ).to.be.revertedWith('INVALID_AMOUNT');

    const userBalanceAfterActions = await pegasysToken.balanceOf(staker.address);
    expect(userBalanceAfterActions.eq(saveUserBalance)).to.be.ok;
  });

  it('User 1 claim all rewards', async () => {
    const {
      stakedPegasysV2,
      pegasysToken,
      users: [, staker],
    } = testEnv;

    const userAddress = staker.address;
    const underlyingAsset = stakedPegasysV2.address;

    const userBalance = await stakedPegasysV2.balanceOf(userAddress);
    const userPegasysBalance = await pegasysToken.balanceOf(userAddress);
    const userRewards = await stakedPegasysV2.stakerRewardsToClaim(userAddress);
    // Get index before actions
    const userIndexBefore = await getUserIndex(stakedPegasysV2, userAddress, underlyingAsset);

    // Claim rewards
    await expect(
      stakedPegasysV2.connect(staker.signer).claimRewards(staker.address, MAX_UINT_AMOUNT)
    );

    // Get index after actions
    const userIndexAfter = await getUserIndex(stakedPegasysV2, userAddress, underlyingAsset);

    const expectedAccruedRewards = getRewards(
      userBalance,
      userIndexAfter,
      userIndexBefore
    ).toString();
    const userPegasysBalanceAfterAction = (await pegasysToken.balanceOf(userAddress)).toString();

    expect(userPegasysBalanceAfterAction).to.be.equal(
      userPegasysBalance.add(userRewards).add(expectedAccruedRewards).toString()
    );
  });

  it('User 6 stakes 50 SYS, with the rewards not enabled', async () => {
    const { stakedPegasysV2, pegasysToken, users } = testEnv;
    const amount = ethers.utils.parseEther('50');
    const sixStaker = users[5];

    // Disable rewards via config
    const assetsConfig = {
      emissionPerSecond: '0',
      totalStaked: '0',
    };

    // Checks rewards
    const actions = () => [
      pegasysToken.connect(sixStaker.signer).approve(stakedPegasysV2.address, amount),
      stakedPegasysV2.connect(sixStaker.signer).stake(sixStaker.address, amount),
    ];

    await compareRewardsAtAction(stakedPegasysV2, sixStaker.address, actions, false, assetsConfig);

    // Check expected stake balance for six staker
    expect((await stakedPegasysV2.balanceOf(sixStaker.address)).toString()).to.be.equal(
      amount.toString()
    );

    // Expect rewards balance to still be zero
    const rewardsBalance = await (
      await stakedPegasysV2.getTotalRewardsBalance(sixStaker.address)
    ).toString();
    expect(rewardsBalance).to.be.equal('0');
  });

  it('User 6 stakes 30 SYS more, with the rewards not enabled', async () => {
    const { stakedPegasysV2, pegasysToken, users } = testEnv;
    const amount = ethers.utils.parseEther('30');
    const staker = users[1];
    const sixStaker = users[5];
    const saveBalanceBefore = new BigNumber(
      (await stakedPegasysV2.balanceOf(sixStaker.address)).toString()
    );
    // Keep rewards disabled via config
    const assetsConfig = {
      emissionPerSecond: '0',
      totalStaked: '0',
    };

    // Checks rewards
    const actions = () => [
      pegasysToken.connect(sixStaker.signer).approve(stakedPegasysV2.address, amount),
      stakedPegasysV2.connect(sixStaker.signer).stake(sixStaker.address, amount),
    ];

    await compareRewardsAtAction(stakedPegasysV2, sixStaker.address, actions, false, assetsConfig);

    // Expect rewards balance to still be zero
    const rewardsBalance = await (
      await stakedPegasysV2.getTotalRewardsBalance(sixStaker.address)
    ).toString();
    expect(rewardsBalance).to.be.equal('0');
  });

  it('Validates staker cooldown with stake() while being on valid unstake window', async () => {
    const { stakedPegasysV2, pegasysToken, users } = testEnv;
    const amount1 = ethers.utils.parseEther('50');
    const amount2 = ethers.utils.parseEther('20');
    const staker = users[4];

    // Checks rewards
    const actions = () => [
      pegasysToken.connect(staker.signer).approve(stakedPegasysV2.address, amount1.add(amount2)),
      stakedPegasysV2.connect(staker.signer).stake(staker.address, amount1),
    ];

    await compareRewardsAtAction(stakedPegasysV2, staker.address, actions, false);

    await stakedPegasysV2.connect(staker.signer).cooldown();

    const cooldownActivationTimestamp = await timeLatest();

    await advanceBlock(
      cooldownActivationTimestamp.plus(new BigNumber(COOLDOWN_SECONDS).plus(1000)).toNumber()
    ); // We fast-forward time to just after the unstake window

    const stakerCooldownTimestampBefore = new BigNumber(
      (await stakedPegasysV2.stakersCooldowns(staker.address)).toString()
    );
    await waitForTx(await stakedPegasysV2.connect(staker.signer).stake(staker.address, amount2));
    const latestTimestamp = await timeLatest();
    const expectedCooldownTimestamp = amount2
      .mul(latestTimestamp.toString())
      .add(amount1.mul(stakerCooldownTimestampBefore.toString()))
      .div(amount2.add(amount1));
    expect(expectedCooldownTimestamp.toString()).to.be.equal(
      (await stakedPegasysV2.stakersCooldowns(staker.address)).toString()
    );
  });
});
