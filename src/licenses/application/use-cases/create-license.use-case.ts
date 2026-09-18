import { Injectable, Inject } from '@nestjs/common';
import {
  ILicenseRepository,
  LICENSE_REPOSITORY_TOKEN,
} from '../../domain/repositories/license.repository.interface';
import { DomainPlanType } from '../../domain/entities/license.entity';
import * as crypto from 'crypto';

export interface CreateLicenseCommand {
  customerEmail: string;
  customerName?: string;
  planType?: DomainPlanType;
  maxDevices?: number;
  expiresInDays?: number;
}

@Injectable()
export class CreateLicenseUseCase {
  constructor(
    @Inject(LICENSE_REPOSITORY_TOKEN)
    private readonly licenseRepository: ILicenseRepository,
  ) {}

  private generateLicenseKey(): string {
    const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `ORD-${segment()}-${segment()}-${segment()}`;
  }

  async execute(command: CreateLicenseCommand) {
    const key = this.generateLicenseKey();
    const expiresAt = command.expiresInDays
      ? new Date(Date.now() + command.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const license = await this.licenseRepository.create({
      key,
      customerEmail: command.customerEmail,
      customerName: command.customerName,
      planType: command.planType ?? DomainPlanType.LIFETIME,
      maxDevices: command.maxDevices ?? 3,
      expiresAt,
    });

    return {
      success: true,
      license: {
        id: license.id,
        key: license.key,
        customerEmail: license.customerEmail,
        customerName: license.customerName,
        planType: license.planType,
        maxDevices: license.maxDevices,
        expiresAt: license.expiresAt,
        status: license.status,
      },
    };
  }
}
