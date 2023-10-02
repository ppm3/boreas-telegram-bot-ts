import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TelegramBotService } from './telegram-bot.service';
import { UserStateService } from 'src/user-state/user-state.service';
import { ApiSensorsService } from '../api-sensors/api-sensors.service';
import { BasicStateMachineService } from '../basic-state-machine/basic-state-machine.service';
import { BotStatusEvaluationBotPlantReminderService } from '../bot-status-evaluation-bot-plant-reminder/bot-status-evaluation-bot-plant-reminder.service';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [TelegramBotService, BotStatusEvaluationBotPlantReminderService, ApiSensorsService, UserStateService, BasicStateMachineService, HttpService],
  exports: [TelegramBotService],
})
export class TelegramBotModule { }
