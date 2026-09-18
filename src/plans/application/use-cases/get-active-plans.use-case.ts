import { Injectable, Inject } from '@nestjs/common';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/repositories/plan.repository.interface';

@Injectable()
export class GetActivePlansUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute() {
    return this.planRepository.findActivePlans();
  }
}
