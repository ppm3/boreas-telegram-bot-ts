import { Context, SessionFlavor } from 'grammy';

interface sessionData {
  itemLevel: string;
  isDEGANft: boolean;
}

export type SessionContext = Context & SessionFlavor<sessionData>;
export type BotContext = Context;
