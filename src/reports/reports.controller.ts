import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { GetAllReportsUseCase } from './application/use-cases/get-all-reports.use-case';
import { CreateReportDto } from './presentation/dtos/report.dtos';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly createReportUseCase: CreateReportUseCase,
    private readonly getAllReportsUseCase: GetAllReportsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createReport(@Body() dto: CreateReportDto) {
    return this.createReportUseCase.execute(dto);
  }

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getAllReports() {
    return this.getAllReportsUseCase.execute();
  }
}
