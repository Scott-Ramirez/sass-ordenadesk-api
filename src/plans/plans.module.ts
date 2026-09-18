import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PrismaPlanRepository } from './infrastructure/repositories/prisma-plan.repository';
import { PLAN_REPOSITORY_TOKEN } from './domain/repositories/plan.repository.interface';
import { GetActivePlansUseCase } from './application/use-cases/get-active-plans.use-case';
import { GetPlanByIdUseCase } from './application/use-cases/get-plan-by-id.use-case';

@Module({
  controllers: [PlansController],
  providers: [
    {
      provide: PLAN_REPOSITORY_TOKEN,
      useClass: PrismaPlanRepository,
    },
    GetActivePlansUseCase,
    GetPlanByIdUseCase,
  ],
  exports: [PLAN_REPOSITORY_TOKEN, GetActivePlansUseCase, GetPlanByIdUseCase],
})
export class PlansModule {}
