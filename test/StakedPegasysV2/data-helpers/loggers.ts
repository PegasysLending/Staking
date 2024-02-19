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
  stakedPegasysV2: StakedPegasys
) => {
  console.log(
    `[stakedPegasysV2.balanceOf(${staker})]: ${(
      await stakedPegasysV2.balanceOf(staker)
    ).toString()}`
  );
};

export const logGetStakeTotalRewardsBalance = async (
  staker: tEthereumAddress,
  stakedPegasysV2: StakedPegasys
) => {
  console.log(
    `[stakedPegasysV2.getTotalRewardsBalance(${staker})]: ${(
      await stakedPegasysV2.getTotalRewardsBalance(staker)
    ).toString()}`
  );
};

export const logRewardPerStakedPegasys = async (stakedPegasysV2: StakedPegasys) => {
  console.log(
    `[stakedPegasysV2.getRewardPerStakedPegasys()]: ${(
      await stakedPegasysV2.getRewardPerStakedPegasys()
    ).toString()}`
  );
};
