import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { HttpModule } from "@nestjs/axios";
import apiConfig from "src/configs/api.config";
import { AppController } from "./app.controller";
import { MongooseModule } from "@nestjs/mongoose";
import mongoDbConfig from "src/configs/mongo-db.config";
import telegramConfig from "src/configs/telegram.config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import sensorApiConfig from "src/configs/sensor-api.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserStateModule } from "src/user-state/user-state.module";
import { ApiSensorsModule } from "src/api-sensors/api-sensors.module";
import { TelegramBotService } from "src/telegram-bot/telegram-bot.service";
import { BotPlantReminderModule } from "src/bot-plant-reminder/bot-plant-reminder.module";
import { BasicStateMachineModule } from "src/basic-state-machine/basic-state-machine.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [apiConfig, mongoDbConfig, telegramConfig, sensorApiConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        dbName: config.get<string>('mongo.db'),
      }),
    }),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    AppModule,
    HttpModule,
    UserStateModule,
    ApiSensorsModule,
    BasicStateMachineModule,
    BotPlantReminderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TelegramBotService,
  ],
})
export class AppModule { }
