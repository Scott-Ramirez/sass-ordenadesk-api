import { Injectable, Inject } from '@nestjs/common';
import {
  IReportRepository,
  REPORT_REPOSITORY_TOKEN,
  DomainIssueType,
} from '../../domain/repositories/report.repository.interface';
import { BadRequestDomainException } from '../../../core/domain/domain-exceptions.base';

export interface CreateReportCommand {
  type?: DomainIssueType;
  description: string;
  contactEmail?: string;
  diagnostics?: any;
}

@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY_TOKEN)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(command: CreateReportCommand) {
    if (!command.description || command.description.trim().length === 0) {
      throw new BadRequestDomainException(
        'La descripción del reporte es requerida.',
        'EMPTY_REPORT_DESCRIPTION',
      );
    }

    const { id } = await this.reportRepository.create(command);

    return {
      success: true,
      message: 'Reporte recibido exitosamente. Gracias por tu feedback.',
      reportId: id,
    };
  }
}
