import { Injectable, Inject } from '@nestjs/common';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
} from '../../domain/repositories/report.repository.interface';

@Injectable()
export class GetAllReportsUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(limit = 100) {
    return this.reportRepository.findAll(limit);
  }
}
