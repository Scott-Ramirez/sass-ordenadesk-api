import { ForbiddenDomainException } from '../../../core/domain/domain-exceptions.base';

export class TrialLimitReachedException extends ForbiddenDomainException {
  readonly usedCount: number;
  readonly remainingCount: number;

  constructor(usedCount: number) {
    super(
      'Has agotado las 3 limpiezas gratuitas en esta computadora. Activa tu licencia PRO para continuar.',
      'TRIAL_LIMIT_REACHED',
    );
    this.usedCount = usedCount;
    this.remainingCount = 0;
  }
}
