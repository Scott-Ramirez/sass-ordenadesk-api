import { Controller, Post, Body, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ActivateLicenseUseCase } from './application/use-cases/activate-license.use-case';
import { ValidateLicenseUseCase } from './application/use-cases/validate-license.use-case';
import { DeactivateLicenseUseCase } from './application/use-cases/deactivate-license.use-case';
import { CreateLicenseUseCase } from './application/use-cases/create-license.use-case';
import {
  ActivateLicenseDto,
  ValidateLicenseDto,
  DeactivateLicenseDto,
  CreateLicenseDto,
} from './presentation/dtos/license.dtos';

@Controller('licenses')
export class LicensesController {
  constructor(
    private readonly activateUseCase: ActivateLicenseUseCase,
    private readonly validateUseCase: ValidateLicenseUseCase,
    private readonly deactivateUseCase: DeactivateLicenseUseCase,
    private readonly createUseCase: CreateLicenseUseCase,
  ) {}

  /**
   * Activa una licencia en un equipo. Protegido contra fuerza bruta por Rate Limiting.
   */
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async activate(@Body() dto: ActivateLicenseDto, @Ip() ip: string) {
    return this.activateUseCase.execute({
      ...dto,
      clientIp: ip,
    });
  }

  /**
   * Valida la licencia silenciosamente para un equipo.
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async validate(@Body() dto: ValidateLicenseDto) {
    return this.validateUseCase.execute(dto);
  }

  /**
   * Desvincula un equipo para liberar cupo.
   */
  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deactivate(@Body() dto: DeactivateLicenseDto, @Ip() ip: string) {
    return this.deactivateUseCase.execute({
      ...dto,
      clientIp: ip,
    });
  }

  /**
   * Emisión de nueva licencia.
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async createLicense(@Body() dto: CreateLicenseDto) {
    return this.createUseCase.execute(dto);
  }
}
