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

makeSuite('StakedPegasys. Basics', (testEnv: TestEnv) => {
  it('Initial configuration after initialize() is correct', async () => {
    const { stakedPegasys, pegasysToken, rewardsVault } = testEnv;

    expect(await stakedPegasys.name()).to.be.equal(STAKED_SYS_NAME);
    expect(await stakedPegasys.symbol()).to.be.equal(STAKED_SYS_SYMBOL);
    expect(await stakedPegasys.decimals()).to.be.equal(STAKED_SYS_DECIMALS);
    expect(await stakedPegasys.REVISION()).to.be.equal(1);
    expect(await stakedPegasys.STAKED_TOKEN()).to.be.equal(pegasysToken.address);
    expect(await stakedPegasys.REWARD_TOKEN()).to.be.equal(pegasysToken.address);
    expect((await stakedPegasys.COOLDOWN_SECONDS()).toString()).to.be.equal(COOLDOWN_SECONDS);
    expect((await stakedPegasys.UNSTAKE_WINDOW()).toString()).to.be.equal(UNSTAKE_WINDOW);
    expect(await stakedPegasys.REWARDS_VAULT()).to.be.equal(rewardsVault.address);
  });

  it('Reverts trying to stake 0 amount', async () => {
    const {
      stakedPegasys,
      users: [, staker],
    } = testEnv;
    const amount = '0';

    await expect(
      stakedPegasys.connect(staker.signer).stake(staker.address, amount)
    ).to.be.revertedWith('INVALID_ZERO_AMOUNT');
  });

  it('Reverts trying to activate cooldown with 0 staked amount', async () => {
    const {
      stakedPegasys,
      users: [, staker],
    } = testEnv;
    const amount = '0';

    await expect(stakedPegasys.connect(staker.signer).cooldown()).to.be.revertedWith(
      'INVALID_BALANCE_ON_COOLDOWN'
    );
  });

  it('User 1 stakes 50 SYS: receives 50 SSYS, StakedPegasys balance of SYS is 50 and his rewards to claim are 0', async () => {
    const {
      stakedPegasys,
      pegasysToken,
      users: [, staker],
    } = testEnv;
    const amount = ethers.utils.parseEther('50');

    const saveBalanceBefore = new BigNumber(
      (await stakedPegasys.balanceOf(staker.address)).toString()
    );

    // Prepare actions for the test case
    const actions = () => [
      pegasysToken.connect(staker.signer).approve(stakedPegasys.address, amount),
      stakedPegasys.connect(staker.signer).stake(staker.address, amount),
    ];

    // Check rewards
    await compareRewardsAtAction(stakedPegasys, staker.address, actions);

    // Stake token tests
    expect((await stakedPegasys.balanceOf(staker.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
    expect((await pegasysToken.balanceOf(stakedPegasys.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
    expect((await stakedPegasys.balanceOf(staker.address)).toString()).to.be.equal(amount);
    expect((await pegasysToken.balanceOf(stakedPegasys.address)).toString()).to.be.equal(amount);
  });

  it('User 1 stakes 20 SYS more: his total SSYS balance increases, StakedPegasys balance of Pegasys increases and his reward until now get accumulated', async () => {
    const {
      stakedPegasys,
      pegasysToken,
      users: [, staker],
    } = testEnv;
    const amount = ethers.utils.parseEther('20');

    const saveBalanceBefore = new BigNumber(
      (await stakedPegasys.balanceOf(staker.address)).toString()
    );
    const actions = () => [
      pegasysToken.connect(staker.signer).approve(stakedPegasys.address, amount),
      stakedPegasys.connect(staker.signer).stake(staker.address, amount),
    ];

    // Checks rewards
    await compareRewardsAtAction(stakedPegasys, staker.address, actions, true);

    // Extra test checks
    expect((await stakedPegasys.balanceOf(staker.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
    expect((await pegasysToken.balanceOf(stakedPegasys.address)).toString()).to.be.equal(
      saveBalanceBefore.plus(amount.toString()).toString()
    );
  });

  it('User 1 claim half rewards ', async () => {
    const {
      stakedPegasys,
      pegasysToken,
      users: [, staker],
    } = testEnv;
    // Increase time for bigger rewards
    await increaseTimeAndMine(1000);

    const halfRewards = (await stakedPegasys.stakerRewardsToClaim(staker.address)).div(2);
    const saveUserBalance = await pegasysToken.balanceOf(staker.address);

    await stakedPegasys.connect(staker.signer).claimRewards(staker.address, halfRewards);

    const userBalanceAfterActions = await pegasysToken.balanceOf(staker.address);
    expect(userBalanceAfterActions.eq(saveUserBalance.add(halfRewards))).to.be.ok;
  });

  it('User 1 tries to claim higher reward than current rewards balance', async () => {
    const {
      stakedPegasys,
      pegasysToken,
      users: [, staker],
    } = testEnv;

    const saveUserBalance = await pegasysToken.balanceOf(staker.address);

    // Try to claim more amount than accumulated
    await expect(
      stakedPegasys
        .connect(staker.signer)
        .claimRewards(staker.address, ethers.utils.parseEther('10000'))
    ).to.be.revertedWith('INVALID_AMOUNT');

    const userBalanceAfterActions = await pegasysToken.balanceOf(staker.address);
    expect(userBalanceAfterActions.eq(saveUserBalance)).to.be.ok;
  });

  it('User 1 claim all rewards', async () => {
    const {
      stakedPegasys,
      pegasysToken,
      users: [, staker],
    } = testEnv;

    const userAddress = staker.address;
    const underlyingAsset = stakedPegasys.address;

    const userBalance = await stakedPegasys.balanceOf(userAddress);
    const userPegasysBalance = await pegasysToken.balanceOf(userAddress);
    const userRewards = await stakedPegasys.stakerRewardsToClaim(userAddress);
    // Get index before actions
    const userIndexBefore = await getUserIndex(stakedPegasys, userAddress, underlyingAsset);

    // Claim rewards
    await expect(
      stakedPegasys.connect(staker.signer).claimRewards(staker.address, MAX_UINT_AMOUNT)
    );

    // Get index after actions
    const userIndexAfter = await getUserIndex(stakedPegasys, userAddress, underlyingAsset);

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
    const { stakedPegasys, pegasysToken, users } = testEnv;
    const amount = ethers.utils.parseEther('50');
    const sixStaker = users[5];

    // Disable rewards via config
    const assetsConfig = {
      emissionPerSecond: '0',
      totalStaked: '0',
    };

    // Checks rewards
    const actions = () => [
      pegasysToken.connect(sixStaker.signer).approve(stakedPegasys.address, amount),
      stakedPegasys.connect(sixStaker.signer).stake(sixStaker.address, amount),
    ];

    await compareRewardsAtAction(stakedPegasys, sixStaker.address, actions, false, assetsConfig);

    // Check expected stake balance for six staker
    expect((await stakedPegasys.balanceOf(sixStaker.address)).toString()).to.be.equal(
      amount.toString()
    );

    // Expect rewards balance to still be zero
    const rewardsBalance = await (
      await stakedPegasys.getTotalRewardsBalance(sixStaker.address)
    ).toString();
    expect(rewardsBalance).to.be.equal('0');
  });

  it('User 6 stakes 30 SYS more, with the rewards not enabled', async () => {
    const { stakedPegasys, pegasysToken, users } = testEnv;
    const amount = ethers.utils.parseEther('30');
    const staker = users[1];
    const sixStaker = users[5];
    const saveBalanceBefore = new BigNumber(
      (await stakedPegasys.balanceOf(sixStaker.address)).toString()
    );
    // Keep rewards disabled via config
    const assetsConfig = {
      emissionPerSecond: '0',
      totalStaked: '0',
    };

    // Checks rewards
    const actions = () => [
      pegasysToken.connect(sixStaker.signer).approve(stakedPegasys.address, amount),
      stakedPegasys.connect(sixStaker.signer).stake(sixStaker.address, amount),
    ];

    await compareRewardsAtAction(stakedPegasys, sixStaker.address, actions, false, assetsConfig);

    // Expect rewards balance to still be zero
    const rewardsBalance = await (
      await stakedPegasys.getTotalRewardsBalance(sixStaker.address)
    ).toString();
    expect(rewardsBalance).to.be.equal('0');
  });

  it('Validates staker cooldown with stake() while being on valid unstake window', async () => {
    const { stakedPegasys, pegasysToken, users } = testEnv;
    const amount1 = ethers.utils.parseEther('50');
    const amount2 = ethers.utils.parseEther('20');
    const staker = users[4];

    // Checks rewards
    const actions = () => [
      pegasysToken.connect(staker.signer).approve(stakedPegasys.address, amount1.add(amount2)),
      stakedPegasys.connect(staker.signer).stake(staker.address, amount1),
    ];

    await compareRewardsAtAction(stakedPegasys, staker.address, actions, false);

    await stakedPegasys.connect(staker.signer).cooldown();

    const cooldownActivationTimestamp = await timeLatest();

    await advanceBlock(
      cooldownActivationTimestamp.plus(new BigNumber(COOLDOWN_SECONDS).plus(1000)).toNumber()
    ); // We fast-forward time to just after the unstake window

    const stakerCooldownTimestampBefore = new BigNumber(
      (await stakedPegasys.stakersCooldowns(staker.address)).toString()
    );
    await waitForTx(await stakedPegasys.connect(staker.signer).stake(staker.address, amount2));
    const latestTimestamp = await timeLatest();
    const expectedCooldownTimestamp = amount2
      .mul(latestTimestamp.toString())
      .add(amount1.mul(stakerCooldownTimestampBefore.toString()))
      .div(amount2.add(amount1));
    expect(expectedCooldownTimestamp.toString()).to.be.equal(
      (await stakedPegasys.stakersCooldowns(staker.address)).toString()
    );
  });
});
