import { tEthereumAddress } from '../../../helpers/types';
import { MintableErc20 } from '../../../types/MintableErc20';
import { StakedAgave } from '../../../types/StakedAgave';

export const logAaveTokenBalanceOf = async (
  account: tEthereumAddress,
  aaveToken: MintableErc20
) => {
  console.log(
    `[aaveToken.balanceOf(${account})]: ${(await aaveToken.balanceOf(account)).toString()}`
  );
};

export const logStakedAaveBalanceOf = async (staker: tEthereumAddress, stakedAave: StakedAgave) => {
  console.log(
    `[stakedAave.balanceOf(${staker})]: ${(await stakedAave.balanceOf(staker)).toString()}`
  );
};

export const logGetStakeTotalRewardsBalance = async (
  staker: tEthereumAddress,
  stakedAave: StakedAgave
) => {
  console.log(
    `[stakedAave.getTotalRewardsBalance(${staker})]: ${(
      await stakedAave.getTotalRewardsBalance(staker)
    ).toString()}`
  );
};

export const logRewardPerStakedAave = async (stakedAave: StakedAgave) => {
  console.log(
    `[stakedAave.getRewardPerStakedAave()]: ${(
      await stakedAave.getRewardPerStakedAave()
    ).toString()}`
  );
};
