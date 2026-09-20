export interface CreateTrialUsageParams {
  machineId: string;
  userId?: string;
  cleanupNumber: number;
  itemsOrganized: number;
}

export interface ITrialRepository {
  countByMachineId(machineId: string): Promise<number>;
  createUsage(params: CreateTrialUsageParams): Promise<{ id: string }>;
}

export const TRIAL_REPOSITORY_TOKEN = Symbol('ITrialRepository');
