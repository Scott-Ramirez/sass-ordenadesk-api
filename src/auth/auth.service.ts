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
          name: dto.name || normalizedEmail.split('@')[0],
          termsAcceptedAt: new Date(),
          termsVersion: 'v1.0',
        },
        include: {
          licenses: {
            where: { status: 'ACTIVE' },
          },
        },
      });
    } else if (dto.name && dto.name.trim() && user.name !== dto.name) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name: dto.name },
        include: {
          licenses: {
            where: { status: 'ACTIVE' },
          },
        },
      });
    }

    // Asociar posibles licencias previas compradas con este correo
    await this.prisma.license.updateMany({
      where: { customerEmail: normalizedEmail, userId: null },
      data: { userId: user.id },
    });

    const refreshedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        licenses: {
          include: {
            devices: {
              where: { isActive: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const activeUser = refreshedUser || user;
    const token = this.generateToken(activeUser.id, activeUser.email);

    let trial = { allowed: true, usedCount: 0, remainingCount: 3, maxAllowed: 3 };
    if (dto.machineId) {
      trial = await this.checkTrialUseCase.execute(dto.machineId);
    }

    return {
      token,
      user: {
        id: activeUser.id,
        email: activeUser.email,
        name: activeUser.name,
      },
      trial,
      licenses: (activeUser as any).licenses?.map((lic: any) => ({
        id: lic.id,
        key: lic.key,
        planType: lic.planType,
        status: lic.status,
        maxDevices: lic.maxDevices,
        expiresAt: lic.expiresAt,
        createdAt: lic.createdAt,
        devices: lic.devices?.map((d: any) => ({
          id: d.id,
          machineId: d.machineId,
          machineName: d.machineName,
          osVersion: d.osVersion,
          lastSeenAt: d.lastSeenAt,
        })) || [],
      })) || [],
    };
  }

  verifyToken(token: string): { sub: string; email: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const [b64Payload, signature] = parts;
      const expectedSig = crypto
        .createHmac('sha256', process.env.JWT_SECRET || 'ordenadesk_secret_key_2026')
        .update(b64Payload)
        .digest('base64url');
      if (signature !== expectedSig) return null;
      const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
      return payload;
    } catch (_) {
      return null;
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        licenses: {
          include: {
            devices: {
              where: { isActive: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      licenses: user.licenses.map((lic) => ({
        id: lic.id,
        key: lic.key,
        planType: lic.planType,
        status: lic.status,
        maxDevices: lic.maxDevices,
        expiresAt: lic.expiresAt,
        createdAt: lic.createdAt,
        devices: lic.devices.map((d) => ({
          id: d.id,
          machineId: d.machineId,
          machineName: d.machineName,
          osVersion: d.osVersion,
          lastSeenAt: d.lastSeenAt,
        })),
      })),
    };
  }
}
