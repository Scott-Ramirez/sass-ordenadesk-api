import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetActivePlansUseCase } from './application/use-cases/get-active-plans.use-case';
import { GetPlanByIdUseCase } from './application/use-cases/get-plan-by-id.use-case';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly getActivePlansUseCase: GetActivePlansUseCase,
    private readonly getPlanByIdUseCase: GetPlanByIdUseCase,
  ) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async getAllPlans() {
    return this.getActivePlansUseCase.execute();
  }

  @Get(':id')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async getPlanById(@Param('id') id: string) {
    return this.getPlanByIdUseCase.execute(id);
  }
}
