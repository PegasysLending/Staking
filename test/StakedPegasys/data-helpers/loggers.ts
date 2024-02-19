import { tEthereumAddress } from '../../../helpers/types';
import { MintableErc20 } from '../../../types/MintableErc20';
import { StakedPegasys } from '../../../types/StakedPegasys';

export const logPegasysTokenBalanceOf = async (
  account: tEthereumAddress,
  pegasysToken: MintableErc20
) => {
  console.log(
    `[pegasysToken.balanceOf(${account})]: ${(await pegasysToken.balanceOf(account)).toString()}`
  );
};

export const logStakedPegasysBalanceOf = async (
  staker: tEthereumAddress,
  stakedPegasys: StakedPegasys
) => {
  console.log(
    `[stakedPegasys.balanceOf(${staker})]: ${(await stakedPegasys.balanceOf(staker)).toString()}`
  );
};

export const logGetStakeTotalRewardsBalance = async (
  staker: tEthereumAddress,
  stakedPegasys: StakedPegasys
) => {
  console.log(
    `[stakedPegasys.getTotalRewardsBalance(${staker})]: ${(
      await stakedPegasys.getTotalRewardsBalance(staker)
    ).toString()}`
  );
};

export const logRewardPerStakedPegasys = async (stakedPegasys: StakedPegasys) => {
  console.log(
    `[stakedPegasys.getRewardPerStakedPegasys()]: ${(
      await stakedPegasys.getRewardPerStakedPegasys()
    ).toString()}`
  );
};
