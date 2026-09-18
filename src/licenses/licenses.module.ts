import { Module } from '@nestjs/common';
import { LicensesController } from './licenses.controller';
import { PrismaLicenseRepository } from './infrastructure/repositories/prisma-license.repository';
import { LICENSE_REPOSITORY_TOKEN } from './domain/repositories/license.repository.interface';
import { ActivateLicenseUseCase } from './application/use-cases/activate-license.use-case';
import { ValidateLicenseUseCase } from './application/use-cases/validate-license.use-case';
import { DeactivateLicenseUseCase } from './application/use-cases/deactivate-license.use-case';
import { CreateLicenseUseCase } from './application/use-cases/create-license.use-case';

@Module({
  controllers: [LicensesController],
  providers: [
    {
      provide: LICENSE_REPOSITORY_TOKEN,
      useClass: PrismaLicenseRepository,
    },
    ActivateLicenseUseCase,
    ValidateLicenseUseCase,
    DeactivateLicenseUseCase,
    CreateLicenseUseCase,
  ],
  exports: [
    LICENSE_REPOSITORY_TOKEN,
    ActivateLicenseUseCase,
    ValidateLicenseUseCase,
    DeactivateLicenseUseCase,
    CreateLicenseUseCase,
  ],
})
export class LicensesModule {}
