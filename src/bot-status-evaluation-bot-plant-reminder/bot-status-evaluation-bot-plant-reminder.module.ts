import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserStateService } from '../user-state/user-state.service';
import { ApiSensorsModule } from '../api-sensors/api-sensors.module';
import { ApiSensorsService } from '../api-sensors/api-sensors.service';
import { BotStatusEvaluationBotPlantReminderService } from './bot-status-evaluation-bot-plant-reminder.service';

@Module({
    imports: [
        HttpModule,
        BotStatusEvaluationBotPlantReminderModule,
        ApiSensorsModule,
    ],
    providers: [BotStatusEvaluationBotPlantReminderService, ApiSensorsService, UserStateService],
    exports: [BotStatusEvaluationBotPlantReminderService]
})
export class BotStatusEvaluationBotPlantReminderModule {}
