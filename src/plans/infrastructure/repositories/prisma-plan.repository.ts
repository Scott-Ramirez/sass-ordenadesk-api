import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPlanRepository } from '../../domain/repositories/plan.repository.interface';
import { PlanEntity, PlanPriceEntity } from '../../domain/entities/plan.entity';

@Injectable()
export class PrismaPlanRepository implements IPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActivePlans(): Promise<PlanEntity[]> {
    const rawPlans = await this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: { amount: 'asc' },
        },
      },
    });

    return rawPlans.map(
      (p) =>
        new PlanEntity({
          id: p.id,
          name: p.name,
          description: p.description,
          maxDevices: p.maxDevices,
          hasAutomation: p.hasAutomation,
          hasDuplicates: p.hasDuplicates,
          featuresDisplay: p.featuresDisplay,
          isActive: p.isActive,
          prices: p.prices.map(
            (pr) =>
              new PlanPriceEntity({
                id: pr.id,
                planId: pr.planId,
                currency: pr.currency,
                amount: Number(pr.amount),
                billingInterval: pr.billingInterval,
                gatewayPriceId: pr.gatewayPriceId,
                isActive: pr.isActive,
              }),
          ),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }),
    );
  }

  async findById(id: string): Promise<PlanEntity | null> {
    const raw = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        prices: { where: { isActive: true } },
      },
    });

    if (!raw) return null;

    return new PlanEntity({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      maxDevices: raw.maxDevices,
      hasAutomation: raw.hasAutomation,
      hasDuplicates: raw.hasDuplicates,
      featuresDisplay: raw.featuresDisplay,
      isActive: raw.isActive,
      prices: raw.prices.map(
        (pr) =>
          new PlanPriceEntity({
            id: pr.id,
            planId: pr.planId,
            currency: pr.currency,
            amount: Number(pr.amount),
            billingInterval: pr.billingInterval,
            gatewayPriceId: pr.gatewayPriceId,
            isActive: pr.isActive,
          }),
      ),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
