export interface DeviceProps {
  id: string;
  machineId: string;
  machineName?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  isActive: boolean;
  firstLinkedAt: Date;
  lastSeenAt: Date;
  licenseId: string;
}

export class DeviceEntity {
  readonly id: string;
  readonly machineId: string;
  readonly machineName?: string | null;
  readonly osVersion?: string | null;
  readonly appVersion?: string | null;
  readonly isActive: boolean;
  readonly firstLinkedAt: Date;
  readonly lastSeenAt: Date;
  readonly licenseId: string;

  constructor(props: DeviceProps) {
    this.id = props.id;
    this.machineId = props.machineId;
    this.machineName = props.machineName;
    this.osVersion = props.osVersion;
    this.appVersion = props.appVersion;
    this.isActive = props.isActive;
    this.firstLinkedAt = props.firstLinkedAt;
    this.lastSeenAt = props.lastSeenAt;
    this.licenseId = props.licenseId;
  }
}
