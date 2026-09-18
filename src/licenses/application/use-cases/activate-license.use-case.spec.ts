import { ActivateLicenseUseCase } from './activate-license.use-case';
import { ILicenseRepository } from '../../domain/repositories/license.repository.interface';
import {
  LicenseEntity,
  DomainLicenseStatus,
  DomainPlanType,
} from '../../domain/entities/license.entity';
import { DeviceEntity } from '../../domain/entities/device.entity';
import {
  LicenseNotFoundException,
  LicenseInactiveException,
  DeviceLimitReachedException,
} from '../../domain/exceptions/license.exceptions';

describe('ActivateLicenseUseCase', () => {
  let useCase: ActivateLicenseUseCase;
  let mockRepository: jest.Mocked<ILicenseRepository>;

  beforeEach(() => {
    mockRepository = {
      findByKey: jest.fn(),
      updateStatus: jest.fn(),
      updateDeviceLastSeen: jest.fn(),
      linkDevice: jest.fn(),
      deactivateDevice: jest.fn(),
      create: jest.fn(),
    };

    useCase = new ActivateLicenseUseCase(mockRepository);
  });

  it('debe arrojar LicenseNotFoundException si la clave no existe', async () => {
    mockRepository.findByKey.mockResolvedValue(null);

    await expect(
      useCase.execute({
        key: 'ORD-XXXX-XXXX-XXXX',
        machineId: 'MACHINE-01',
      }),
    ).rejects.toThrow(LicenseNotFoundException);
  });

  it('debe arrojar LicenseInactiveException si la licencia está suspendida', async () => {
    const license = new LicenseEntity({
      id: 'lic-1',
      key: 'ORD-XXXX-XXXX-XXXX',
      planType: DomainPlanType.LIFETIME,
      status: DomainLicenseStatus.SUSPENDED,
      maxDevices: 3,
      customerEmail: 'test@example.com',
      devices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findByKey.mockResolvedValue(license);

    await expect(
      useCase.execute({
        key: 'ORD-XXXX-XXXX-XXXX',
        machineId: 'MACHINE-01',
      }),
    ).rejects.toThrow(LicenseInactiveException);
  });

  it('debe arrojar DeviceLimitReachedException si se alcanza el máximo de equipos', async () => {
    const activeDevice1 = new DeviceEntity({
      id: 'dev-1',
      machineId: 'M1',
      isActive: true,
      firstLinkedAt: new Date(),
      lastSeenAt: new Date(),
      licenseId: 'lic-1',
    });

    const license = new LicenseEntity({
      id: 'lic-1',
      key: 'ORD-1111-2222-3333',
      planType: DomainPlanType.LIFETIME,
      status: DomainLicenseStatus.ACTIVE,
      maxDevices: 1, // Límite de 1
      customerEmail: 'test@example.com',
      devices: [activeDevice1], // Ya tiene 1 ocupado
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findByKey.mockResolvedValue(license);

    await expect(
      useCase.execute({
        key: 'ORD-1111-2222-3333',
        machineId: 'M2-NUEVA',
      }),
    ).rejects.toThrow(DeviceLimitReachedException);
  });

  it('debe vincular con éxito un nuevo equipo dentro del límite permitido', async () => {
    const license = new LicenseEntity({
      id: 'lic-1',
      key: 'ORD-1111-2222-3333',
      planType: DomainPlanType.LIFETIME,
      status: DomainLicenseStatus.ACTIVE,
      maxDevices: 3,
      customerEmail: 'test@example.com',
      devices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newDevice = new DeviceEntity({
      id: 'dev-new',
      machineId: 'MACHINE-NEW',
      isActive: true,
      firstLinkedAt: new Date(),
      lastSeenAt: new Date(),
      licenseId: 'lic-1',
    });

    mockRepository.findByKey.mockResolvedValue(license);
    mockRepository.linkDevice.mockResolvedValue(newDevice);

    const result = await useCase.execute({
      key: 'ORD-1111-2222-3333',
      machineId: 'MACHINE-NEW',
      machineName: 'Mi PC',
    });

    expect(result.success).toBe(true);
    expect(result.license.activeDevicesCount).toBe(1);
    expect(mockRepository.linkDevice).toHaveBeenCalledTimes(1);
  });
});
