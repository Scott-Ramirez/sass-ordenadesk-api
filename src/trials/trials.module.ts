import { Module } from '@nestjs/common';
import { TrialsController } from './trials.controller';
import { PrismaTrialRepository } from './infrastructure/repositories/prisma-trial.repository';
import { TRIAL_REPOSITORY_TOKEN } from './domain/repositories/trial.repository.interface';
import { CheckTrialUseCase } from './application/use-cases/check-trial.use-case';
import { ConsumeTrialUseCase } from './application/use-cases/consume-trial.use-case';

@Module({
  controllers: [TrialsController],
  providers: [
    {
      provide: TRIAL_REPOSITORY_TOKEN,
      useClass: PrismaTrialRepository,
    },
    CheckTrialUseCase,
    ConsumeTrialUseCase,
  ],
  exports: [TRIAL_REPOSITORY_TOKEN, CheckTrialUseCase, ConsumeTrialUseCase],
})
export class TrialsModule {}
