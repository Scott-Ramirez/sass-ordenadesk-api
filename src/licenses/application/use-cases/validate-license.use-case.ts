import { Injectable, Inject } from '@nestjs/common';
import {
  ILicenseRepository,
  LICENSE_REPOSITORY_TOKEN,
} from '../../domain/repositories/license.repository.interface';

export interface ValidateLicenseCommand {
  key: string;
  machineId: string;
}

@Injectable()
export class ValidateLicenseUseCase {
  constructor(
    @Inject(LICENSE_REPOSITORY_TOKEN)
    private readonly licenseRepository: ILicenseRepository,
  ) {}

  async execute(command: ValidateLicenseCommand) {
    const formattedKey = command.key.trim().toUpperCase();

    const license = await this.licenseRepository.findByKey(formattedKey);

    if (!license) {
      return { isValid: false, reason: 'NOT_FOUND' };
    }

    if (!license.isActive()) {
      return { isValid: false, reason: 'INACTIVE', status: license.status };
    }

    if (license.isExpired()) {
      return { isValid: false, reason: 'EXPIRED' };
    }

    const device = license.findDevice(command.machineId);
    if (!device) {
      return { isValid: false, reason: 'DEVICE_NOT_LINKED' };
    }

    // Actualizar heartbeat silencioso
    await this.licenseRepository.updateDeviceLastSeen(device.id);

    return {
      isValid: true,
      planType: license.planType,
      expiresAt: license.expiresAt,
      maxDevices: license.maxDevices,
    };
  }
}
