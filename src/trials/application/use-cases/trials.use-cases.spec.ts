import { CheckTrialUseCase } from './check-trial.use-case';
import { ConsumeTrialUseCase } from './consume-trial.use-case';
import { ITrialRepository } from '../../domain/repositories/trial.repository.interface';
import { TrialLimitReachedException } from '../../domain/exceptions/trial-limit-reached.exception';

describe('Trial Use Cases', () => {
  let mockRepo: jest.Mocked<ITrialRepository>;
  let checkTrialUseCase: CheckTrialUseCase;
  let consumeTrialUseCase: ConsumeTrialUseCase;

  beforeEach(() => {
    mockRepo = {
      countByMachineId: jest.fn(),
      createUsage: jest.fn(),
    };

    checkTrialUseCase = new CheckTrialUseCase(mockRepo);
    consumeTrialUseCase = new ConsumeTrialUseCase(mockRepo);
  });

  describe('CheckTrialUseCase', () => {
    it('debe devolver 3 limpiezas restantes para una máquina nueva', async () => {
      mockRepo.countByMachineId.mockResolvedValue(0);

      const result = await checkTrialUseCase.execute('MACHINE-NEW');

      expect(result.allowed).toBe(true);
      expect(result.usedCount).toBe(0);
      expect(result.remainingCount).toBe(3);
    });

    it('debe devolver 0 restantes cuando se han usado las 3 limpiezas', async () => {
      mockRepo.countByMachineId.mockResolvedValue(3);

      const result = await checkTrialUseCase.execute('MACHINE-USED');

      expect(result.allowed).toBe(false);
      expect(result.remainingCount).toBe(0);
    });
  });

  describe('ConsumeTrialUseCase', () => {
    it('debe permitir consumir una limpieza si está dentro del límite', async () => {
      mockRepo.countByMachineId.mockResolvedValue(1);
      mockRepo.createUsage.mockResolvedValue({ id: 'rec-2' });

      const result = await consumeTrialUseCase.execute({
        machineId: 'MACHINE-01',
        itemsOrganized: 15,
      });

      expect(result.success).toBe(true);
      expect(result.cleanupNumber).toBe(2);
      expect(result.remainingCount).toBe(1);
    });

    it('debe arrojar TrialLimitReachedException si ya usó 3 limpiezas', async () => {
      mockRepo.countByMachineId.mockResolvedValue(3);

      await expect(
        consumeTrialUseCase.execute({
          machineId: 'MACHINE-01',
          itemsOrganized: 10,
        }),
      ).rejects.toThrow(TrialLimitReachedException);
    });
  });
});
