import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { PrismaReportRepository } from './infrastructure/repositories/prisma-report.repository';
import { REPORT_REPOSITORY_TOKEN } from './domain/repositories/report.repository.interface';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { GetAllReportsUseCase } from './application/use-cases/get-all-reports.use-case';

@Module({
  controllers: [ReportsController],
  providers: [
    {
      provide: REPORT_REPOSITORY_TOKEN,
      useClass: PrismaReportRepository,
    },
    CreateReportUseCase,
    GetAllReportsUseCase,
  ],
  exports: [REPORT_REPOSITORY_TOKEN, CreateReportUseCase, GetAllReportsUseCase],
})
export class ReportsModule {}
