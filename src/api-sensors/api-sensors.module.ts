import { Module } from '@nestjs/common';
import { ApiSensorsService } from './api-sensors.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [  HttpModule ],
  providers: [ApiSensorsService],
  exports: [ApiSensorsService]
})
export class ApiSensorsModule {}
