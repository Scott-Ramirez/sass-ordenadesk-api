import {
  IsEnum,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { DomainIssueType } from '../../domain/repositories/report.repository.interface';

export class CreateReportDto {
  @IsEnum(DomainIssueType, {
    message: 'El tipo de incidencia debe ser BUG, FEATURE o PERFORMANCE.',
  })
  @IsOptional()
  type?: DomainIssueType;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción del reporte es requerida.' })
  @MaxLength(3000, { message: 'La descripción no puede exceder 3000 caracteres.' })
  description!: string;

  @IsEmail({}, { message: 'El correo de contacto no es válido.' })
  @IsOptional()
  @MaxLength(150)
  contactEmail?: string;

  @IsOptional()
  diagnostics?: any;
}
