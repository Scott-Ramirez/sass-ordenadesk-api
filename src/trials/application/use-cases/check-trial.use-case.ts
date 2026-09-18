import { Injectable, Inject } from '@nestjs/common';
import {
  ITrialRepository,
  TRIAL_REPOSITORY_TOKEN,
} from '../../domain/repositories/trial.repository.interface';

export const MAX_TRIAL_CLEANUPS = 3;

@Injectable()
export class CheckTrialUseCase {
  constructor(
    @Inject(TRIAL_REPOSITORY_TOKEN)
    private readonly trialRepository: ITrialRepository,
  ) {}

  async execute(machineId: string) {
    const usedCount = await this.trialRepository.countByMachineId(machineId);
    const remainingCount = Math.max(0, MAX_TRIAL_CLEANUPS - usedCount);

    return {
      allowed: remainingCount > 0,
      usedCount,
      remainingCount,
      maxAllowed: MAX_TRIAL_CLEANUPS,
    };
  }
}
