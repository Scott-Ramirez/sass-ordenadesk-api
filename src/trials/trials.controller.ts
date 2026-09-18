import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
  async consumeTrial(@Body() dto: ConsumeTrialDto) {
    return this.consumeTrialUseCase.execute(dto);
  }
}
