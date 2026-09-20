import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CheckTrialUseCase } from './application/use-cases/check-trial.use-case';
import { ConsumeTrialUseCase } from './application/use-cases/consume-trial.use-case';
import { CheckTrialDto, ConsumeTrialDto } from './presentation/dtos/trial.dtos';

@Controller('trials')
export class TrialsController {
  constructor(
    private readonly checkTrialUseCase: CheckTrialUseCase,
    private readonly consumeTrialUseCase: ConsumeTrialUseCase,
  ) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async checkTrial(@Body() dto: CheckTrialDto) {
    return this.checkTrialUseCase.execute(dto.machineId);
  }

  @Post('consume')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async consumeTrial(
    @Body() dto: ConsumeTrialDto,
    @Headers('authorization') authHeader?: string,
  ) {
    let resolvedUserId = dto.userId;

    if (!resolvedUserId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7).trim();
        const parts = token.split('.');
        if (parts.length >= 1) {
          const payload = JSON.parse(
            Buffer.from(parts[0], 'base64url').toString('utf-8'),
          );
          if (payload?.sub) {
            resolvedUserId = payload.sub;
          }
        }
      } catch (_) {}
    }

    return this.consumeTrialUseCase.execute({
      ...dto,
      userId: resolvedUserId,
    });
  }
}
