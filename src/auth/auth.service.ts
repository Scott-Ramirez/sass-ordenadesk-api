import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dtos';
import { CheckTrialUseCase } from '../trials/application/use-cases/check-trial.use-case';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkTrialUseCase: CheckTrialUseCase,
  ) {}

  private generateToken(userId: string, email: string): string {
    const payload = JSON.stringify({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 año
    });
    const b64Payload = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'ordenadesk_secret_key_2026')
      .update(b64Payload)
      .digest('base64url');
    return `${b64Payload}.${signature}`;
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: dto.name || normalizedEmail.split('@')[0],
          termsAcceptedAt: new Date(),
          termsVersion: 'v1.0',
        },
      });
    }

    const token = this.generateToken(user.id, user.email);

    let trial = { allowed: true, usedCount: 0, remainingCount: 3, maxAllowed: 3 };
    if (dto.machineId) {
      trial = await this.checkTrialUseCase.execute(dto.machineId);
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      trial,
      licenses: [],
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        licenses: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    // Si el usuario aún no existe, se crea automáticamente (Auth sin fricción)
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          termsAcceptedAt: new Date(),
          termsVersion: 'v1.0',
        },
        include: {
          licenses: {
            where: { status: 'ACTIVE' },
          },
        },
      });
    }

    const token = this.generateToken(user.id, user.email);

    let trial = { allowed: true, usedCount: 0, remainingCount: 3, maxAllowed: 3 };
    if (dto.machineId) {
      trial = await this.checkTrialUseCase.execute(dto.machineId);
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      trial,
      licenses: user.licenses.map((lic) => ({
        key: lic.key,
        planType: lic.planType,
        maxDevices: lic.maxDevices,
      })),
    };
  }
}
