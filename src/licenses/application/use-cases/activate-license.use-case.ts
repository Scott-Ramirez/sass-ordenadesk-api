import { Injectable, Inject } from '@nestjs/common';
import {
  ILicenseRepository,
  LICENSE_REPOSITORY_TOKEN,
} from '../../domain/repositories/license.repository.interface';
import { DomainLicenseStatus } from '../../domain/entities/license.entity';
import {
  LicenseNotFoundException,
  LicenseInactiveException,
  LicenseExpiredException,
  DeviceLimitReachedException,
} from '../../domain/exceptions/license.exceptions';

export interface ActivateLicenseCommand {
  key: string;
  machineId: string;
  machineName?: string;
  osVersion?: string;
  appVersion?: string;
  clientIp?: string;
}

@Injectable()
export class ActivateLicenseUseCase {
  constructor(
    @Inject(LICENSE_REPOSITORY_TOKEN)
    private readonly licenseRepository: ILicenseRepository,
  ) {}

  async execute(command: ActivateLicenseCommand) {
    const formattedKey = command.key.trim().toUpperCase();

    const license = await this.licenseRepository.findByKey(formattedKey);

    if (!license) {
      throw new LicenseNotFoundException();
    }

    if (!license.isActive()) {
      throw new LicenseInactiveException(license.status);
    }

    if (license.isExpired()) {
      await this.licenseRepository.updateStatus(
        license.id,
        DomainLicenseStatus.EXPIRED,
      );
      throw new LicenseExpiredException();
    }

    // Verificar si el dispositivo ya estaba vinculado
    const existingDevice = license.findDevice(command.machineId);

    if (existingDevice) {
      await this.licenseRepository.updateDeviceLastSeen(existingDevice.id, {
        machineName: command.machineName ?? existingDevice.machineName ?? undefined,
        osVersion: command.osVersion ?? existingDevice.osVersion ?? undefined,
        appVersion: command.appVersion ?? existingDevice.appVersion ?? undefined,
      });

      return {
        success: true,
        message: 'Licencia activa y verificada para este equipo.',
        license: {
          key: license.key,
          planType: license.planType,
          status: license.status,
          maxDevices: license.maxDevices,
          activeDevicesCount: license.activeDevicesCount,
          expiresAt: license.expiresAt,
          customerName: license.customerName,
        },
        device: existingDevice,
      };
    }

    // Si es nuevo dispositivo, comprobar regla de negocio en entidad de dominio
    if (license.hasReachedDeviceLimit()) {
      throw new DeviceLimitReachedException(
        license.maxDevices,
        license.activeDevicesCount,
      );
    }

    // Guardar nuevo dispositivo
    const newDevice = await this.licenseRepository.linkDevice({
      licenseId: license.id,
      machineId: command.machineId,
      machineName: command.machineName,
      osVersion: command.osVersion,
      appVersion: command.appVersion,
      ipAddress: command.clientIp,
    });

    return {
      success: true,
      message: '¡Licencia activada con éxito en este equipo!',
      license: {
        key: license.key,
        planType: license.planType,
        status: license.status,
        maxDevices: license.maxDevices,
        activeDevicesCount: license.activeDevicesCount + 1,
        expiresAt: license.expiresAt,
        customerName: license.customerName,
      },
      device: newDevice,
    };
  }
}
