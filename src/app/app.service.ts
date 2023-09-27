import { Injectable } from '@nestjs/common';
import { JSONObject } from 'src/interfaces/json-interface';

@Injectable()
export class AppService {
  getPong(): string {
    return 'PONG';
  }

  getHealthCheck(): JSONObject {
    return {
      uptime: process.uptime(),
    };
  }
}
