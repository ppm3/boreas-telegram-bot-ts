import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserStateModule } from 'src/user-state/user-state.module';
import { BotPlantReminderService } from './bot-plant-reminder.service';
import { ApiSensorsService } from '../api-sensors/api-sensors.service';
import { BasicStateMachineService } from '../basic-state-machine/basic-state-machine.service';
import { BotStatusEvaluationBotPlantReminderService } from 'src/bot-status-evaluation-bot-plant-reminder/bot-status-evaluation-bot-plant-reminder.service';

@Module({
  imports: [
    HttpModule,
    UserStateModule,
  ],
  providers: [ BotPlantReminderService, ApiSensorsService, BasicStateMachineService, BotStatusEvaluationBotPlantReminderService],
  exports: [BotPlantReminderService]
})
export class BotPlantReminderModule {}
