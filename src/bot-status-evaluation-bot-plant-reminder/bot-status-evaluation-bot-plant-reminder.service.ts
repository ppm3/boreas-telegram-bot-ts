import { BotContext } from '../telegram-bot/types';
import { Injectable, Logger } from '@nestjs/common';
import { UserState } from '../user-state/user-state.schema';
import { UserStateService } from '../user-state/user-state.service';
import { ApiSensorsService } from '../api-sensors/api-sensors.service';
import { CreateUserStateDto } from '../user-state/dtos/create-user-state';
import { IParams } from '../basic-state-machine/interfaces/params.interface';
import { StateStatusEnum, stateStatus } from '../user-state/enums/state-status.enum';
import { BasicStateMachineService } from '../basic-state-machine/basic-state-machine.service';
import { BotStateEnum, sensorValuesStates, showMenusStates } from '../user-state/enums/bot-states.enum';

@Injectable()
export class BotStatusEvaluationBotPlantReminderService {
    private logger = new Logger(BotStatusEvaluationBotPlantReminderService.name);

    private basicStateMachineService: BasicStateMachineService;

    constructor(
        private readonly userStateService: UserStateService,
        private readonly apiSensorsService: ApiSensorsService,
    ) { }

    async createUserState(userState: CreateUserStateDto): Promise<UserState> {
        const state = await this.userStateService.insert(userState);
        return state;
    }

    setBasicStateMachineService(bsms: BasicStateMachineService) {
        this.basicStateMachineService = bsms;
    }

    async evaluateState(ctx: BotContext, states: { initial?: string, state: string, next?: string }, userInput: boolean = false) {
        const {
            from: { id: chatId },
        } = ctx;

        if (ctx.from.is_bot) {
            return ctx.reply('🤖');
        }

        const user = await this.apiSensorsService.getUserByChatId(chatId);
        let currentState: UserState;

        if (user) {
            [currentState] = await this.userStateService.findLastStateWithIds(
                user.chat_id,
                user._id,
            );
        } else {
            [currentState] = await this.userStateService.findLastState(chatId);
        }

        this.logger.debug(currentState);

        // prepare the object with the information of the state
        const newUserState: CreateUserStateDto = {
            message_id: 0,
            chat_id: chatId,
            initial_state: (states.initial) ? states.initial : '',
            current_bot_state: states.state,
            status: StateStatusEnum.current,
            next_bot_state: (states.next) ? states.next : '',
            user_id: user ? user._id : null,
        };

        if (!currentState) {
            this.logger.debug(
                '> Empty last state > it\'ll be send to USER validation',
            );
            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                state: states.state,
                nextState: states.next,
                userState: await this.createUserState(newUserState),
            });
        } else if (
            stateStatus.includes(currentState.status) &&
            states.state != BotStateEnum.cancel
        ) {
            this.logger.debug(`> Change the status: ${currentState.status} > satte: ${currentState.current_bot_state}`);
            return this.basicStateMachineService
                .force()
                .setState(currentState.current_bot_state, ctx, {
                    user,
                    state: states.state,
                    userState: currentState,
                    nextState: states.next,
                });
        } else if (currentState.current_bot_state == BotStateEnum.cancel) {
            this.logger.debug(' > Actual state is CANCEL, it\'s necessary to move a new state');
            newUserState.next_bot_state = '';
            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                state: states.state,
                nextState: states.next,
                userState: await this.createUserState(newUserState),
            });
        } else if (states.state === BotStateEnum.cancel) {
            this.logger.debug(` > Change to completed if the command is cancel: ${states.state}`);
            await this.userStateService.updateOne(currentState.id, {
                status: StateStatusEnum.completed,
            });

            // register a cancel state
            newUserState.status = StateStatusEnum.completed;

            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                userState: await this.createUserState(newUserState),
            });
        }

        // ------------------
        if (currentState.next_bot_state === states.state) {
            this.logger.debug(` > Current state: ${states.state} > Next state: ${currentState.next_bot_state}`);
            let state: string = states.state;

            await this.userStateService.updateOne(currentState.id, {
                status: StateStatusEnum.completed,
            });

            if (userInput) {
                this.logger.debug('> User input TRUE');
                state = currentState.initial_state
                newUserState.current_bot_state = currentState.initial_state;
            }

            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                state,
                nextState: currentState.next_bot_state,
                userState: await this.createUserState(newUserState),
            });
        } else if (showMenusStates.includes(currentState.current_bot_state)) {
            this.logger.debug(`> Show menu > current_bot_state > ${currentState.current_bot_state}`);
            currentState = await this.userStateService.updateOne(currentState.id, {
                next_bot_state: states.state,
            });

            // state > update the state for show value of sensor
            newUserState.current_bot_state = states.state;
            newUserState.next_bot_state = currentState.current_bot_state;

            // move the option state
            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                state: states.state,
                nextState: currentState.current_bot_state,
                userState: await this.createUserState(newUserState),
            });
        } else if (sensorValuesStates.includes(states.state) && currentState.status != BotStateEnum.cancel) {
            // state > update the state for show value of sensor
            newUserState.current_bot_state = states.state;
            newUserState.next_bot_state = currentState.current_bot_state;

            // > move the option state
            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                state: states.state,
                userState: await this.createUserState(newUserState),
            });
        } else {
            this.logger.debug('State > No cumple ninguna condicional> Se crea un nuevo estado');
            return this.basicStateMachineService.setState(states.state, ctx, {
                user,
                state: states.state,
                nextState: states.next,
                userState: await this.createUserState(newUserState),
            });
        }

    }

    async updateCurrentState(
        messageId: number,
        status: string,
        params?: IParams,
    ): Promise<UserState> {
        const user = !params.user ? null : params.user;

        const state: UserState = await this.userStateService.updateOne(
            params.userState.id,
            {
                status: status,
                message_id: messageId,
                next_bot_state: params.nextState,
                user_id: user ? user._id : null,
            },
        );

        return state;
    }
}
