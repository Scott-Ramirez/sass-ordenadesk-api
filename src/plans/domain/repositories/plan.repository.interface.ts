import { PlanEntity } from '../entities/plan.entity';

export interface IPlanRepository {
  findActivePlans(): Promise<PlanEntity[]>;
  findById(id: string): Promise<PlanEntity | null>;
}

export const PLAN_REPOSITORY_TOKEN = Symbol('IPlanRepository');
