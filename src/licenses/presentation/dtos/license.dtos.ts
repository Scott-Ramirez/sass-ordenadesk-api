import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
  IsEmail,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { DomainPlanType } from '../../domain/entities/license.entity';

export class ActivateLicenseDto {
  @IsString({ message: 'La clave de licencia debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La clave de licencia no puede estar vacía.' })
  @MaxLength(50, { message: 'La clave de licencia no debe exceder 50 caracteres.' })
  key!: string;

  @IsString({ message: 'El identificador de máquina debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El identificador de máquina es requerido.' })
  @MaxLength(128, { message: 'El machineId no debe exceder 128 caracteres.' })
  machineId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  machineName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  osVersion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  appVersion?: string;
}

export class ValidateLicenseDto {
  @IsString({ message: 'La clave de licencia debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La clave de licencia no puede estar vacía.' })
  @MaxLength(50)
  key!: string;

  @IsString({ message: 'El identificador de máquina debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El identificador de máquina es requerido.' })
  @MaxLength(128)
  machineId!: string;
}

export class DeactivateLicenseDto {
  @IsString({ message: 'La clave de licencia debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La clave de licencia no puede estar vacía.' })
  @MaxLength(50)
  key!: string;

  @IsString({ message: 'El identificador de máquina debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El identificador de máquina es requerido.' })
  @MaxLength(128)
  machineId!: string;
}

export class CreateLicenseDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @MaxLength(150)
  customerEmail!: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  customerName?: string;

  @IsEnum(DomainPlanType, { message: 'El tipo de plan especificado no es válido.' })
  @IsOptional()
  planType?: DomainPlanType;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxDevices?: number;

  @IsInt()
  @Min(1)
  @Max(3650)
  @IsOptional()
  expiresInDays?: number;
}
