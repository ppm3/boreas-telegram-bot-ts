import { BotContext } from "../../telegram-bot/types";
import { IParams } from "./params.interface";

export interface IState {
    name: string;
    onEnter?: (ctx?: BotContext, params?: IParams) => void;
    onUpdate?: (dt: number, params?: IParams) => void;
    onExit?: (ctx?: BotContext, params?: IParams) => void;
}