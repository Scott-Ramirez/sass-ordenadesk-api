import { DeviceEntity } from './device.entity';

export enum DomainLicenseStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum DomainPlanType {
  LIFETIME = 'LIFETIME',
  ANNUAL = 'ANNUAL',
  MONTHLY = 'MONTHLY',
  FREE = 'FREE',
}

export interface LicenseProps {
  id: string;
  key: string;
  planType: DomainPlanType;
  status: DomainLicenseStatus;
  maxDevices: number;
  expiresAt?: Date | null;
  customerEmail: string;
  customerName?: string | null;
  devices: DeviceEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class LicenseEntity {
  readonly id: string;
  readonly key: string;
  readonly planType: DomainPlanType;
  private _status: DomainLicenseStatus;
  readonly maxDevices: number;
  readonly expiresAt?: Date | null;
  readonly customerEmail: string;
  readonly customerName?: string | null;
  private _devices: DeviceEntity[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: LicenseProps) {
    this.id = props.id;
    this.key = props.key;
    this.planType = props.planType;
    this._status = props.status;
    this.maxDevices = props.maxDevices;
    this.expiresAt = props.expiresAt;
    this.customerEmail = props.customerEmail;
    this.customerName = props.customerName;
    this._devices = props.devices || [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get status(): DomainLicenseStatus {
    return this._status;
  }

  get devices(): DeviceEntity[] {
    return [...this._devices];
  }

  get activeDevices(): DeviceEntity[] {
    return this._devices.filter((d) => d.isActive);
  }

  get activeDevicesCount(): number {
    return this.activeDevices.length;
  }

  isActive(): boolean {
    return this._status === DomainLicenseStatus.ACTIVE;
  }

  isExpired(now = new Date()): boolean {
    return !!(this.expiresAt && this.expiresAt < now);
  }

  findDevice(machineId: string): DeviceEntity | undefined {
    return this.activeDevices.find((d) => d.machineId === machineId);
  }

  hasReachedDeviceLimit(): boolean {
    return this.activeDevicesCount >= this.maxDevices;
  }

  expire(): void {
    this._status = DomainLicenseStatus.EXPIRED;
  }
}
