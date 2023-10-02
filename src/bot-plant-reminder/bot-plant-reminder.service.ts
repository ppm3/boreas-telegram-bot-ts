import { SensorEnum } from './enums/sensors.enum';
import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from 'src/telegram-bot/types';
import { commandStates } from './commands/commands';
import { cleanText, evaluateRegex } from './libs/string.lib';
import { BotStateEnum } from 'src/user-state/enums/bot-states.enum';
import { CreateUserDto } from 'src/api-sensors/dtos/create-user.dto';
import { ApiSensorsService } from 'src/api-sensors/api-sensors.service';
import { StateStatusEnum } from 'src/user-state/enums/state-status.enum';
import { IParams } from 'src/basic-state-machine/interfaces/params.interface';
import { BasicStateMachineService } from 'src/basic-state-machine/basic-state-machine.service';
import { BotStatusEvaluationBotPlantReminderService } from 'src/bot-status-evaluation-bot-plant-reminder/bot-status-evaluation-bot-plant-reminder.service';

@Injectable()
export class BotPlantReminderService {
    private readonly logger = new Logger(BotPlantReminderService.name);

    constructor(
        private readonly apiSensorServices: ApiSensorsService,
        private readonly basicStateMachineService: BasicStateMachineService,
        private readonly botStatusEvaluationService: BotStatusEvaluationBotPlantReminderService,
    ) { }

    addStateMachine() {
        this.basicStateMachineService.define(
            this, 'BotPlantReminder',
        );

        return this;
    }

    defineStates() {
        this.basicStateMachineService
            .addState('idle')
            .addState(BotStateEnum.userValidation, {
                onEnter: this.userValidation,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.selectCommand, {
                onEnter: this.showWelcomeMessage,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.setDeviceId, {
                onEnter: this.showMessageDevice,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.registerDeviceId, {
                onEnter: this.registerUserDevice,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.showMenuSensors, {
                onEnter: this.showMenuSensors,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.showMenuAlerts, {
                onEnter: this.showMenuAlerts,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.showMenuAverages, {
                onEnter: this.showMenuAverages,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.getActualHumidity, {
                onEnter: this.getActualHumidity,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.getActualTemperature, {
                onEnter: this.getActualTemperature,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.getActualSoil, {
                onEnter: this.getActualSoilHumidity,
                onUpdate: this.updateCompleteUserState,
            })
            .addState(BotStateEnum.cancel, {
                onEnter: this.cancelUserBot,
                onUpdate: this.updateCompleteUserState,
            });

        this.basicStateMachineService.setState('idl');
        this.botStatusEvaluationService.setBasicStateMachineService(this.basicStateMachineService);
    }

    async commandHandler(ctx: BotContext) {
        const { update: { message: { text } } } = ctx;

        const commandText = text.trim().replace(/^./, '');

        const command = commandStates.find((cmd) => cmd.command === commandText);

        if (!command) {
            ctx.reply('Lo siento, ese comando no esta disponible 😔');
            return;
        }

        if (command.state === BotStateEnum.showHelp) {
            return this[command.state.toLocaleLowerCase()](ctx);
        } else if (command.state === BotStateEnum.cancel) {
            return this.botStatusEvaluationService.evaluateState(ctx, {
                state: BotStateEnum.cancel,
            });
        }

        this.botStatusEvaluationService.evaluateState(ctx, {
            state: BotStateEnum.userValidation,
            next: command.state,
            initial: command.state
        });
    }

    async messageTextHandler(ctx: BotContext) {
        const { message: { text } } = ctx;

        if (evaluateRegex(cleanText(text), /\bhola/gm))
            this.botStatusEvaluationService.evaluateState(
                ctx, { 
                    state: BotStateEnum.userValidation,
                    next: BotStateEnum.selectCommand, 
                }, true);
        else if (evaluateRegex(cleanText(text), /[a-zA-Z0-9]{64}/gm))
            this.botStatusEvaluationService.evaluateState(ctx, { state: BotStateEnum.registerDeviceId }, true);
        else
            await ctx.api.sendMessage(
                ctx.from.id,
                'Por favor selecciona una de las opciones del menu'
            );
    }

    async callbackQueryHandler(ctx: BotContext) {
        const option = ctx.callbackQuery.data;

        const sensorOptions: string[] = [
            BotStateEnum.getActualSoil,
            BotStateEnum.getActualHumidity,
            BotStateEnum.getActualTemperature,
        ];

        if (sensorOptions.includes(option.trim())) {
            await this.botStatusEvaluationService.evaluateState(
                ctx,
                {
                    state: option.trim(),
                });
        } else {
            await ctx.api.sendMessage(
                ctx.from.id,
                '🤖 Lo siento, esa opción no esta disponible',
            );
        }
    }

    private show_help(ctx: BotContext): void {
        const { from: { id: chatId } } = ctx;

        ctx.api.sendMessage(
            chatId,
            `🤖 Comandos disponibles:

        \\- *inicio* Inicia la conversación 
        \\- *alertas* Configuración de alertas
        \\- *sensores* Obtener información en tiempo real
        \\- *promedios* Muestra el promedio de los sensores
        \\- *ayuda* Muestra comandos disponibles
        \\- *cancel* Finaliza la conversación
            `,
            { parse_mode: 'MarkdownV2' },
        );
    }

    // --> User States > userValidation > setDeviceId > registerDeviceId

    private async userValidation(ctx: BotContext, params?: IParams) {
        const { from: userInfo } = ctx
        const { id: chatId } = userInfo;

        let user = await this.apiSensorServices.getUserByChatId(chatId);

        if (user) {
            if (user.device_id) {
                // indicate to the user that select another option
                if (params.nextState == BotStateEnum.userValidation) {
                    const resp = await ctx.api.sendMessage(
                        user.chat_id,
                        '🤖  Por favor, seleccione una opción del menu.'
                    );

                    this.basicStateMachineService.update(resp.message_id, {
                        user: user,
                        userState: params.userState
                    });

                } else {
                    // validate user > validate device -> move to another state
                    const resp = await ctx.api.sendMessage(
                        user.chat_id,
                        '🤖  ...'
                    );
                    await this.basicStateMachineService.update(resp.message_id, {
                        user: user,
                        nextState: params.nextState,
                        userState: params.userState,
                    });

                    this.botStatusEvaluationService.evaluateState(
                        ctx,
                        { state: params.nextState }
                    );
                }
            } else {
                // validate user -> ask device id
                const nextState = BotStateEnum.setDeviceId;

                const resp = await ctx.api.sendMessage(
                    user.chat_id,
                    '🤖  ...'
                );

                await this.basicStateMachineService.update(resp.message_id, {
                    user: user,
                    nextState: nextState,
                    userState: params.userState,
                });

                await this.botStatusEvaluationService.evaluateState(ctx, {
                    state: nextState,
                    initial: params.userState.initial_state
                });
            }

        } else {
            // > register user
            const resp = await ctx.api.sendMessage(
                chatId,
                'Hola 👋 *' +
                userInfo.first_name +
                '* Bienvenido al bot de alertas de clima de oficina y plantas\\. 🌱🌡🫧 \n\nEs la primera vez que interactuas conmigo, así que voy a tener que guardar cierta información tuya\\. No te preocupes, es muy básica, solamente para poder identificarte\\.',
                { parse_mode: 'MarkdownV2' },
            );

            // register user
            const userData: CreateUserDto = {
                chat_id: chatId,
                username: userInfo.username,
                last_name: userInfo.last_name,
                first_name: userInfo.first_name,
                language_code: userInfo.language_code,
                device_id: null,
                configuration: {
                    alerts: {
                        temperature: true,
                        humidity: true,
                        sensor_soil: true,
                    },
                    totalAlerts: {
                        temperature: 0,
                        humidity: 0,
                        sensor_soil: 0,
                    },
                },
            };

            const newUser = await this.apiSensorServices.createUser(userData);

            if (newUser._id == null) {
                throw new Error('Unable to create user - try again later');
            }

            await this.basicStateMachineService.update(resp.message_id, {
                user: user,
                state: params.state,
                nextState: BotStateEnum.setDeviceId,
                userState: params.userState,
            });

            await this.botStatusEvaluationService.evaluateState(ctx, {
                state: BotStateEnum.setDeviceId,
                initial: params.userState.initial_state
            });
        }
    }

    private async showMessageDevice(ctx: BotContext, params?: IParams) {
        const { from } = ctx;
        const resp = await ctx.api.sendMessage(
            from.id,
            `🤖 Me falta un dato para que te pueda proporcionar información\\.
          
          _¿Cual es el identificador de tu dispositvo?_`,
            { parse_mode: 'MarkdownV2' },
        );

        await this.basicStateMachineService.update(resp.message_id, {
            user: params.user,
            userState: params.userState,
            nextState: BotStateEnum.registerDeviceId,
        });
    }

    private async registerUserDevice(ctx: BotContext, params?: IParams) {
        const { from: userInfo, message: { text } } = ctx
        const { id: chatId } = userInfo;
        const { user } = params;
        let resp: any;

        resp = await ctx.api.sendMessage(
            chatId,
            '🤖  ... actualizando ... '
        );

        const updateUser = await this.apiSensorServices.updateUserDeviceId({
            user: user._id,
            chat: user.chat_id,
            device: cleanText(text),
        });

        if (updateUser._id == null) {
            throw new Error('Unable to update user - try again later');
        } else {
            resp = await ctx.api.sendMessage(
                chatId,
                '🤖 Perfecto, tu dispositivo se vinculo con exito a tu cuenta. '
            )
        }

        // update state of register device
        await this.basicStateMachineService.update(resp.message_id, {
            user: user,
            state: params.state,
            nextState: params.userState.initial_state,
            userState: params.userState,
        });

        // move next state to show respective menu
        await this.botStatusEvaluationService.evaluateState(ctx, {
            state: params.nextState,
            initial: params.userState.initial_state
        });

    }

    private async showWelcomeMessage(ctx: BotContext, params?: IParams) {
        const user = params.user;

        const resp = await ctx.api.sendMessage(
            user.chat_id,
            `🤖 Hola ${user.first_name}\\. \n\nSelecciona una opción del menu de comandos\\.`,
            { parse_mode: 'MarkdownV2' },
        );
        // update state of register device
        await this.basicStateMachineService.update(resp.message_id, {
            user: user,
            state: params.state,
            nextState: params.userState.initial_state,
            userState: params.userState,
        });
    }

    // --> Sensor States > showMenuSensors > getActualHumidity | getActualTemperature | getActualSoilHumidity

    private async showMenuSensors(ctx: BotContext, params?: IParams) {
        const resp = await ctx.api.sendMessage(
            ctx.from.id,
            '🤖 Estas son las opciones disponibles: ',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Temperatura actual',
                                callback_data: BotStateEnum.getActualTemperature,
                            },
                        ],
                        [
                            {
                                text: 'Humedad actual',
                                callback_data: BotStateEnum.getActualHumidity,
                            },
                        ],
                        [
                            {
                                text: 'Humedad de las plantas',
                                callback_data: BotStateEnum.getActualSoil,
                            },
                        ],
                    ],
                },
            },
        );

        this.basicStateMachineService.update(resp.message_id, params);
    }

    private async getActualHumidity(ctx: BotContext, params?: IParams) {
        try {
            const user = params.user;
            const record = await this.apiSensorServices.getSensorValue(user.device_id, SensorEnum.humidity);
            const resp = await ctx.api.sendMessage(
                ctx.from.id,
                `La humedad actual de la oficina es de: ${record.toString()}% `,
            );

            params.nextState = BotStateEnum.showMenuSensors;

            await this.basicStateMachineService.update(resp.message_id, params);
        } catch (err) {
            throw new Error('Unable to get humidity');
        }
    }

    private async getActualTemperature(ctx: BotContext, params?: IParams) {
        try {
            const user = params.user;
            const record = await this.apiSensorServices.getSensorValue(user.device_id, SensorEnum.temperature);
            const resp = await ctx.api.sendMessage(
                ctx.from.id,
                `La temperatura actual de la oficina es de ${record.toString()} °C`,
            );

            params.nextState = BotStateEnum.showMenuSensors;

            await this.basicStateMachineService.update(resp.message_id, params);
        } catch (err) {
            throw new Error('Unable to get temperature');
        }
    }

    private async getActualSoilHumidity(ctx: BotContext, params?: IParams) {
        try {
            const user = params.user;
            const sensorValues = await this.apiSensorServices.getSoilSensorValues(user.device_id);
            const resp = await ctx.api.sendMessage(
                ctx.from.id,
                `Tus plantas actualmente tienen los siguientes niveles de humedad en suelo:\n\t\\- Derecha: ${sensorValues.right}%\n\t\\- Centro: ${sensorValues.center}%\n\t\\- Izquierda: ${sensorValues.left}%`,
                { parse_mode: 'MarkdownV2' },
            );

            params.nextState = BotStateEnum.showMenuSensors;

            await this.basicStateMachineService.update(resp.message_id, params);

        } catch (err) {
            throw new Error('Unable to get soil humidity');
        }
    }

    // change alerts flags > temperature | humidity | soil

    private async showMenuAlerts(ctx: BotContext, params?: IParams) {
        const resp = await ctx.api.sendMessage(
            ctx.from.id,
            'Quieres apagar/encender las siguitens alertas:',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Temperatura actual',
                                callback_data: BotStateEnum.getActualTemperature,
                            },
                        ],
                        [
                            {
                                text: 'Humedad actual',
                                callback_data: BotStateEnum.getActualHumidity,
                            },
                        ],
                        [
                            {
                                text: 'Humedad de las plantas',
                                callback_data: BotStateEnum.getActualSoil,
                            },
                        ],
                    ],
                },
            },
        );

        this.basicStateMachineService.update(resp.message_id, params);
    }

    // show avaraages per sensor > temperature | humidity | soil

    private async showMenuAverages(ctx: BotContext, params?: IParams) {
        const user = params.user;
        const resp = await ctx.api.sendMessage(
            user.chat_id,
            'Estas son las opciones disponibles: ',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Temperatura',
                                callback_data: BotStateEnum.getActualTemperature,
                            },
                        ],
                        [
                            {
                                text: 'Humedad de la oficina',
                                callback_data: BotStateEnum.getActualHumidity,
                            },
                        ],
                        [
                            {
                                text: 'Humedad de las plantas',
                                callback_data: BotStateEnum.getActualSoil,
                            },
                        ],
                    ],
                },
            },
        );

        this.basicStateMachineService.update(resp.message_id, params);
    }

    // cancel session with the bot

    private async cancelUserBot(ctx: BotContext, params?: IParams) {
        const resp = await ctx.api.sendMessage(
            ctx.from.id,
            '🤖  ¡Gracias por usar el bot! 👋',
        );

        await this.basicStateMachineService.update(resp.message_id, params);
    }

    private async updateCompleteUserState(
        dt: number,
        params?: IParams,
    ): Promise<any> {
        return await this.botStatusEvaluationService.updateCurrentState(
            dt,
            StateStatusEnum.completed,
            params,
        );
    }

}
