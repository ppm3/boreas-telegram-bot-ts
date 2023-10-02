import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from 'src/telegram-bot/types';
import { IParams } from './interfaces/params.interface';
import { IState } from './interfaces/states.interface';

let idCount = 0;

@Injectable()
export class BasicStateMachineService {
    private context?: object;
    private currentState?: IState;
    private isChangingState = false;
    private id = (++idCount).toString();
    private changeStateQueue: string[] = [];
    private states = new Map<string, IState>();

    private logger = new Logger(BasicStateMachineService.name);

    constructor() {}

    define(context?: object, id?: string) {
        this.context = context;
        this.id = id ?? this.id;
    }

    isCurrentState(name: string) {
        if (!this.currentState) {
            return false;
        }

        return this.currentState.name === name;
    }

    addState(
        name: string,
        config?: {
            onEnter?: (ctx?: BotContext, params?: IParams) => void;
            onUpdate?: (dt: number, params?: IParams) => void;
            onExit?: (ctx?: BotContext, params?: IParams) => void;
        },
    ) {
        const context = this.context;

        this.states.set(name, {
            name,
            onEnter: config?.onEnter.bind(this.context),
            onUpdate: config?.onUpdate.bind(this.context),
            onExit: config?.onExit?.bind(this.context),
        });

        return this;
    }

    force() {
        this.isChangingState = false;
        return this;
    }

    async setState(name: string, botContext?: BotContext, params?: IParams) {
        if (!this.states.has(name)) {
            this.logger.warn(`Tried to change to unknown state: ${name}`);
            return this;
        }

        if (this.isCurrentState(name)) {
            this.logger.warn(`The state is the same: ${name}`);
            return this;
        }

        if (this.isChangingState) {
            this.changeStateQueue.push(name);
            this.logger.warn(`Is changing state: ${name}`);
            return this;
        }

        this.isChangingState = true;

        this.logger.log(
            `[StateMachine (${this.id})] change from ${this.currentState?.name ?? 'none'
            } to ${name}`,
        );

        if (this.currentState && this.currentState.onExit) {
            this.currentState.onExit(botContext, params);
        }

        this.currentState = this.states.get(name)!;

        if (this.currentState.onEnter) {
            this.currentState.onEnter(botContext, params);
        }

        this.isChangingState = false;
        return this;
    }

    async update(dt: number, params?: IParams) {
        if (this.changeStateQueue.length > 0) {
            this.setState(this.changeStateQueue.shift()!);
            return;
        }

        if (this.currentState && this.currentState.onUpdate) {
            this.currentState.onUpdate(dt, params);
        }

        return this;
    }
}