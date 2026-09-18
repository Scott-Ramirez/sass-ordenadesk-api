import { IsString, IsNotEmpty, MaxLength, IsInt, Min, Max } from 'class-validator';

export class CheckTrialDto {
  @IsString({ message: 'El identificador de máquina debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El identificador de máquina es requerido.' })
  @MaxLength(128, { message: 'El machineId no debe exceder 128 caracteres.' })
  machineId!: string;
}

export class ConsumeTrialDto {
  @IsString({ message: 'El identificador de máquina debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El identificador de máquina es requerido.' })
  @MaxLength(128, { message: 'El machineId no debe exceder 128 caracteres.' })
  machineId!: string;

  @IsInt({ message: 'itemsOrganized debe ser un número entero.' })
  @Min(0, { message: 'itemsOrganized no puede ser negativo.' })
  @Max(1000000, { message: 'itemsOrganized supera el límite permitido.' })
  itemsOrganized!: number;
}
