import { BigNumber } from 'ethers';
import { PegasysDistributionManager } from '../../../types/PegasysDistributionManager';
import { StakedPegasys } from '../../../types/StakedPegasys';
import { PegasysIncentivesController } from '../../../types/PegasysIncentivesController';
import { StakedPegasysV2 } from '../../../types/StakedPegasysV2';

export type UserStakeInput = {
  underlyingAsset: string;
  stakedByUser: string;
  totalStaked: string;
};

export type UserPositionUpdate = UserStakeInput & {
  user: string;
};
export async function getUserIndex(
  distributionManager:
    | PegasysDistributionManager
    | PegasysIncentivesController
    | StakedPegasys
    | StakedPegasysV2,
  user: string,
  asset: string
): Promise<BigNumber> {
  return await distributionManager.getUserAssetData(user, asset);
}
