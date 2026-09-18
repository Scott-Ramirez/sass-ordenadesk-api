export enum DomainIssueType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  PERFORMANCE = 'PERFORMANCE',
}

export enum DomainReportStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export interface CreateReportParams {
  type?: DomainIssueType;
  description: string;
  contactEmail?: string;
  diagnostics?: any;
}

export interface ReportItem {
  id: string;
  type: DomainIssueType;
  description: string;
  contactEmail?: string | null;
  diagnostics?: any;
  status: DomainReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportRepository {
  create(params: CreateReportParams): Promise<{ id: string }>;
  findAll(limit?: number): Promise<ReportItem[]>;
}

export const REPORT_REPOSITORY_TOKEN = Symbol('IReportRepository');
