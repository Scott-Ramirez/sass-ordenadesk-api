import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ITrialRepository,
  CreateTrialUsageParams,
} from '../../domain/repositories/trial.repository.interface';

@Injectable()
export class PrismaTrialRepository implements ITrialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countByMachineId(machineId: string): Promise<number> {
    return this.prisma.trialUsage.count({
      where: { machineId },
    });
  }

  async createUsage(params: CreateTrialUsageParams): Promise<{ id: string }> {
    const record = await this.prisma.trialUsage.create({
      data: {
        machineId: params.machineId,
        cleanupNumber: params.cleanupNumber,
        itemsOrganized: params.itemsOrganized,
      },
    });
    return { id: record.id };
  }
}
