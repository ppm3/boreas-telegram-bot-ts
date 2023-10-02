import { Bot, BotError, GrammyError, HttpError } from 'grammy';
import { BotContext } from './types';
import { limit } from '@grammyjs/ratelimiter';
import { ConfigService } from '@nestjs/config';
import { commandsMenu } from '../bot-plant-reminder/commands/commands';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { ParseModeFlavor, hydrateReply } from '@grammyjs/parse-mode';
import { globalConfig, groupConfig, outConfig } from '../configs/telegram-bot.config';
import { BotPlantReminderService } from 'src/bot-plant-reminder/bot-plant-reminder.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
    private logger = new Logger(TelegramBotService.name);
    constructor(
        private readonly configService: ConfigService,
        @Inject(BotPlantReminderService) private botPlantReminderService: BotPlantReminderService,
    ) { }

    onModuleInit() {
        this.initializeBot();
    }

    initializeBot(): boolean {
        const commands: string[] = commandsMenu.reduce((prev, curr) => { prev.push(curr.command); return prev }, []);
        commands.push('start');

        this.botPlantReminderService.addStateMachine().defineStates();

        const throttler = apiThrottler({
            global: globalConfig,
            group: groupConfig,
            out: outConfig,
        });

        const bot = new Bot<ParseModeFlavor<BotContext>>(
            this.configService.get('telegram_token'),
        );

        bot.use(hydrateReply);
        bot.api.config.use(throttler);
        bot.api.setMyCommands(commandsMenu);

        bot.use(
            limit({
                timeFrame: 2000,
                limit: 3,
                onLimitExceeded: async (ctx) => {
                    await ctx.reply('Please refrain from sending too many requests!');
                },
            })
        );

        bot.command(commands, (ctx: BotContext) => { return this.botPlantReminderService.commandHandler(ctx); });
        bot.on('message:text', (ctx: BotContext) => { return this.botPlantReminderService.messageTextHandler(ctx); });
        bot.on('callback_query', (ctx: BotContext) => { return this.botPlantReminderService.callbackQueryHandler(ctx); });
        bot.catch((err) => { return this.errorHandler(err); });
        bot.start();

        this.logger.debug('--> started bot <--');
        return true;
    }

    async errorHandler(err: BotError) {
        const ctx = err.ctx;
        ctx.reply('🤖 Sorry, something went wrong!');
        
        this.logger.error(
            `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
            { metadata: err.error }
        );

        const e = err.error;
        if (e instanceof GrammyError) {
            this.logger.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
                metadata: e.message,
                stack: e.stack,
            });
        } else if (e instanceof HttpError) {
            this.logger.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
                metadata: e.error,
                stack: e.stack,
            });
        } else {
            this.logger.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
                metadata: e,
            });
        }
    }
}
