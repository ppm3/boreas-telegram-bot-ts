import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { HealthCheckController } from './health-check.controller';

describe('HealthCheckController', () => {
  let healthCheckController: HealthCheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [AppService],
    }).compile();

    healthCheckController = app.get<HealthCheckController>(HealthCheckController);
  });

  describe('health check status', () => {
    it('should be return a json with uptime value', () => {
      const resp = healthCheckController.getHealthCheckStatus();

      expect(resp).not.toBeNull();
      expect(Object.keys(resp)).toContain('uptime');
    });
  });
});
