import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IReportRepository,
  CreateReportParams,
  ReportItem,
  DomainIssueType,
  DomainReportStatus,
} from '../../domain/repositories/report.repository.interface';
import { IssueType, ReportStatus } from '@prisma/client';

@Injectable()
export class PrismaReportRepository implements IReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateReportParams): Promise<{ id: string }> {
    const report = await this.prisma.report.create({
      data: {
        type: (params.type as unknown as IssueType) ?? IssueType.BUG,
        description: params.description.trim(),
        contactEmail: params.contactEmail?.trim(),
        diagnostics: params.diagnostics,
        status: ReportStatus.PENDING,
      },
    });

    return { id: report.id };
  }

  async findAll(limit = 100): Promise<ReportItem[]> {
    const reports = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return reports.map((r) => ({
      id: r.id,
      type: r.type as unknown as DomainIssueType,
      description: r.description,
      contactEmail: r.contactEmail,
      diagnostics: r.diagnostics,
      status: r.status as unknown as DomainReportStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
