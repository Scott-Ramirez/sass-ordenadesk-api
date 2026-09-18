import { LicenseEntity, DomainLicenseStatus, DomainPlanType } from '../entities/license.entity';
import { DeviceEntity } from '../entities/device.entity';

export interface SaveDeviceParams {
  licenseId: string;
  machineId: string;
  machineName?: string;
  osVersion?: string;
  appVersion?: string;
  ipAddress?: string;
}

export interface CreateLicenseParams {
  key: string;
  customerEmail: string;
  customerName?: string;
  planType: DomainPlanType;
  maxDevices: number;
  expiresAt?: Date | null;
}

export interface ILicenseRepository {
  findByKey(key: string): Promise<LicenseEntity | null>;
  updateStatus(licenseId: string, status: DomainLicenseStatus): Promise<void>;
  updateDeviceLastSeen(
    deviceId: string,
    details?: { machineName?: string; osVersion?: string; appVersion?: string },
  ): Promise<void>;
  linkDevice(params: SaveDeviceParams): Promise<DeviceEntity>;
  deactivateDevice(
    licenseId: string,
    machineId: string,
    ipAddress?: string,
  ): Promise<boolean>;
  create(params: CreateLicenseParams): Promise<LicenseEntity>;
}

export const LICENSE_REPOSITORY_TOKEN = Symbol('ILicenseRepository');
