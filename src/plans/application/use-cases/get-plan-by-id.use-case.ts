import { Injectable, Inject } from '@nestjs/common';
import {
  IPlanRepository,
  PLAN_REPOSITORY_TOKEN,
} from '../../domain/repositories/plan.repository.interface';
import { NotFoundDomainException } from '../../../core/domain/domain-exceptions.base';

@Injectable()
export class GetPlanByIdUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(id: string) {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundDomainException(
        `El plan con ID ${id} no fue encontrado.`,
        'PLAN_NOT_FOUND',
      );
    }
    return plan;
  }
}
