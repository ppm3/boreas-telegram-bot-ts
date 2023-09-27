import { Module } from '@nestjs/common';
import { BasicStateMachineService } from './basic-state-machine.service';

@Module({
  providers: [BasicStateMachineService],
  exports: [BasicStateMachineModule],
})
export class BasicStateMachineModule {}
