import {
  NotFoundDomainException,
  BadRequestDomainException,
  ForbiddenDomainException,
} from '../../../core/domain/domain-exceptions.base';

export class LicenseNotFoundException extends NotFoundDomainException {
  constructor() {
    super('La clave de licencia ingresada no existe.', 'LICENSE_NOT_FOUND');
  }
}

export class LicenseInactiveException extends BadRequestDomainException {
  constructor(status: string) {
    super(`Esta licencia se encuentra en estado: ${status}.`, 'LICENSE_INACTIVE');
  }
}

export class LicenseExpiredException extends BadRequestDomainException {
  constructor() {
    super(
      'Esta licencia ha expirado. Por favor renueva tu suscripción.',
      'LICENSE_EXPIRED',
    );
  }
}

export class DeviceLimitReachedException extends ForbiddenDomainException {
  readonly maxDevices: number;
  readonly activeDevicesCount: number;

  constructor(maxDevices: number, activeDevicesCount: number) {
    super(
      `Has alcanzado el límite máximo de ${maxDevices} equipos para esta licencia. Desvincula un equipo anterior para usar este.`,
      'DEVICE_LIMIT_REACHED',
    );
    this.maxDevices = maxDevices;
    this.activeDevicesCount = activeDevicesCount;
  }
}
