import { License as PrismaLicense, Device as PrismaDevice } from '@prisma/client';
import {
  LicenseEntity,
  DomainLicenseStatus,
  DomainPlanType,
} from '../../domain/entities/license.entity';
import { DeviceEntity } from '../../domain/entities/device.entity';

export class LicenseMapper {
  static toDomainDevice(raw: PrismaDevice): DeviceEntity {
    return new DeviceEntity({
      id: raw.id,
      machineId: raw.machineId,
      machineName: raw.machineName,
      osVersion: raw.osVersion,
      appVersion: raw.appVersion,
      isActive: raw.isActive,
      firstLinkedAt: raw.firstLinkedAt,
      lastSeenAt: raw.lastSeenAt,
      licenseId: raw.licenseId,
    });
  }

  static toDomainLicense(
    raw: PrismaLicense & { devices?: PrismaDevice[] },
  ): LicenseEntity {
    return new LicenseEntity({
      id: raw.id,
      key: raw.key,
      planType: raw.planType as unknown as DomainPlanType,
      status: raw.status as unknown as DomainLicenseStatus,
      maxDevices: raw.maxDevices,
      expiresAt: raw.expiresAt,
      customerEmail: raw.customerEmail,
      customerName: raw.customerName,
      devices: raw.devices ? raw.devices.map(this.toDomainDevice) : [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
