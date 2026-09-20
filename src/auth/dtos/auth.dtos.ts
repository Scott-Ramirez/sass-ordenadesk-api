import { IsEmail, IsString, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  machineId?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  machineId?: string;
}
