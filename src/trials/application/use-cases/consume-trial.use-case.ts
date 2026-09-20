import { Injectable, Inject } from '@nestjs/common';
import {
  ITrialRepository,
  TRIAL_REPOSITORY_TOKEN,
} from '../../domain/repositories/trial.repository.interface';
import { TrialLimitReachedException } from '../../domain/exceptions/trial-limit-reached.exception';
import { MAX_TRIAL_CLEANUPS } from './check-trial.use-case';

export interface ConsumeTrialCommand {
  machineId: string;
  userId?: string;
  itemsOrganized: number;
}

@Injectable()
export class ConsumeTrialUseCase {
  constructor(
    @Inject(TRIAL_REPOSITORY_TOKEN)
    private readonly trialRepository: ITrialRepository,
  ) {}

  async execute(command: ConsumeTrialCommand) {
    const currentCount = await this.trialRepository.countByMachineId(
      command.machineId,
    );

    if (currentCount >= MAX_TRIAL_CLEANUPS) {
      throw new TrialLimitReachedException(currentCount);
    }

    const nextNumber = currentCount + 1;

    const record = await this.trialRepository.createUsage({
      machineId: command.machineId,
      userId: command.userId,
      cleanupNumber: nextNumber,
      itemsOrganized: command.itemsOrganized,
    });

    const remainingCount = MAX_TRIAL_CLEANUPS - nextNumber;

    return {
      success: true,
      cleanupNumber: nextNumber,
      remainingCount,
      recordId: record.id,
    };
  }
}
