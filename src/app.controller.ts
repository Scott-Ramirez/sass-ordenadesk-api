import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getRoot() {
    return {
      name: 'OrdenaDesk SaaS API',
      version: '1.0.0',
      status: 'online',
      endpoints: {
        health: '/health',
        plans: '/plans',
      },
    };
  }

  @Get('health')
  async getHealth() {
    const [plansCount, pricesCount, licensesCount, devicesCount, reportsCount, trialUsagesCount] =
      await Promise.all([
        this.prisma.plan.count(),
        this.prisma.planPrice.count(),
        this.prisma.license.count(),
        this.prisma.device.count(),
        this.prisma.report.count(),
        this.prisma.trialUsage.count(),
      ]);

    return {
      status: 'ok',
      service: 'OrdenaDesk Commercial & Telemetry API',
      version: 'v1.0.0',
      database: 'connected (Supabase PostgreSQL)',
      timestamp: new Date().toISOString(),
      stats: {
        activePlans: plansCount,
        configuredPrices: pricesCount,
        totalLicenses: licensesCount,
        activeDevices: devicesCount,
        trialUsagesLogged: trialUsagesCount,
        totalReports: reportsCount,
      },
    };
  }

  @Get('plans')
  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: { amount: 'asc' },
        },
      },
    });
  }
}
