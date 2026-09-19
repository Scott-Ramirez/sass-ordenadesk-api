import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlansModule } from './plans/plans.module';
import { LicensesModule } from './licenses/licenses.module';
import { TrialsModule } from './trials/trials.module';
import { ReportsModule } from './reports/reports.module';
import { TimeoutInterceptor } from './core/interceptors/timeout.interceptor';

@Module({
  imports: [
    // Rate Limiting global contra saturación y ataques DDoS / fuerza bruta
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Ventana de 1 minuto
        limit: 100, // Máximo 100 peticiones por minuto por IP por defecto
      },
    ]),
    PrismaModule,
    PlansModule,
    LicensesModule,
    TrialsModule,
    AuthModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new TimeoutInterceptor(15000), // Timeout de 15 segundos para no dejar sockets colgados
    },
  ],
})
export class AppModule {}
