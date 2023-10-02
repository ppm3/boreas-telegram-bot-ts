import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { StateStatusEnum } from "./enums/state-status.enum";

export type userStateDocument = HydratedDocument<UserState>

@Schema()
export class UserState {
    id: string;

    @Prop()
    chat_id: number;

    @Prop()
    message_id: number;

    @Prop()
    next_bot_state: string;

    @Prop()
    current_bot_state: string;

    @Prop()
    initial_state: string;

    @Prop()
    user_id: string;

    @Prop({ enum: StateStatusEnum, default: StateStatusEnum.current })
    status: string;

    @Prop({ default: Date.now })
    created_at: Date;
}

export const UserStateSchema = SchemaFactory.createForClass(UserState);