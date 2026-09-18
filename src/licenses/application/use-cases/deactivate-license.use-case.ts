import { Injectable, Inject } from '@nestjs/common';
import {
  ILicenseRepository,
  LICENSE_REPOSITORY_TOKEN,
} from '../../domain/repositories/license.repository.interface';
import { LicenseNotFoundException } from '../../domain/exceptions/license.exceptions';

export interface DeactivateLicenseCommand {
  key: string;
  machineId: string;
  clientIp?: string;
}

@Injectable()
export class DeactivateLicenseUseCase {
  constructor(
    @Inject(LICENSE_REPOSITORY_TOKEN)
    private readonly licenseRepository: ILicenseRepository,
  ) {}

  async execute(command: DeactivateLicenseCommand) {
    const formattedKey = command.key.trim().toUpperCase();

    const license = await this.licenseRepository.findByKey(formattedKey);

    if (!license) {
      throw new LicenseNotFoundException();
    }

    const deactivated = await this.licenseRepository.deactivateDevice(
      license.id,
      command.machineId,
      command.clientIp,
    );

    if (!deactivated) {
      return {
        success: true,
        message: 'El equipo ya se encontraba desvinculado.',
      };
    }

    return {
      success: true,
      message:
        'Equipo desvinculado exitosamente. Se ha liberado 1 cupo en tu licencia.',
    };
  }
}
