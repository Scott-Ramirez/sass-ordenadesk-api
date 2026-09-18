import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ILicenseRepository,
  SaveDeviceParams,
  CreateLicenseParams,
} from '../../domain/repositories/license.repository.interface';
import { LicenseEntity, DomainLicenseStatus } from '../../domain/entities/license.entity';
import { DeviceEntity } from '../../domain/entities/device.entity';
import { LicenseMapper } from '../mappers/license.mapper';
import { LicenseStatus, PlanType } from '@prisma/client';

@Injectable()
export class PrismaLicenseRepository implements ILicenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string): Promise<LicenseEntity | null> {
    const raw = await this.prisma.license.findUnique({
      where: { key },
      include: {
        devices: true,
      },
    });

    if (!raw) return null;
    return LicenseMapper.toDomainLicense(raw);
  }

  async updateStatus(licenseId: string, status: DomainLicenseStatus): Promise<void> {
    await this.prisma.license.update({
      where: { id: licenseId },
      data: { status: status as unknown as LicenseStatus },
    });
  }

  async updateDeviceLastSeen(
    deviceId: string,
    details?: { machineName?: string; osVersion?: string; appVersion?: string },
  ): Promise<void> {
    await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        lastSeenAt: new Date(),
        ...(details?.machineName !== undefined && { machineName: details.machineName }),
        ...(details?.osVersion !== undefined && { osVersion: details.osVersion }),
        ...(details?.appVersion !== undefined && { appVersion: details.appVersion }),
      },
    });
  }

  async linkDevice(params: SaveDeviceParams): Promise<DeviceEntity> {
    const [rawDevice] = await this.prisma.$transaction([
      this.prisma.device.upsert({
        where: {
          licenseId_machineId: {
            licenseId: params.licenseId,
            machineId: params.machineId,
          },
        },
        update: {
          isActive: true,
          lastSeenAt: new Date(),
          machineName: params.machineName,
          osVersion: params.osVersion,
          appVersion: params.appVersion,
        },
        create: {
          licenseId: params.licenseId,
          machineId: params.machineId,
          machineName: params.machineName,
          osVersion: params.osVersion,
          appVersion: params.appVersion,
          isActive: true,
        },
      }),
      this.prisma.activationLog.create({
        data: {
          licenseId: params.licenseId,
          machineId: params.machineId,
          ipAddress: params.ipAddress,
          action: 'ACTIVATION',
          details: {
            machineName: params.machineName,
            osVersion: params.osVersion,
            appVersion: params.appVersion,
          },
        },
      }),
    ]);

    return LicenseMapper.toDomainDevice(rawDevice);
  }

  async deactivateDevice(
    licenseId: string,
    machineId: string,
    ipAddress?: string,
  ): Promise<boolean> {
    const device = await this.prisma.device.findUnique({
      where: {
        licenseId_machineId: {
          licenseId,
          machineId,
        },
      },
    });

    if (!device || !device.isActive) {
      return false;
    }

    await this.prisma.$transaction([
      this.prisma.device.update({
        where: { id: device.id },
        data: { isActive: false, lastSeenAt: new Date() },
      }),
      this.prisma.activationLog.create({
        data: {
          licenseId,
          machineId,
          ipAddress,
          action: 'DEACTIVATION',
        },
      }),
    ]);

    return true;
  }

  async create(params: CreateLicenseParams): Promise<LicenseEntity> {
    const raw = await this.prisma.license.create({
      data: {
        key: params.key,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        planType: params.planType as unknown as PlanType,
        maxDevices: params.maxDevices,
        expiresAt: params.expiresAt,
        status: LicenseStatus.ACTIVE,
      },
    });

    return LicenseMapper.toDomainLicense(raw);
  }
}
