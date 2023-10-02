import { Types } from 'mongoose';

export class CreateUserStateDto {
  initial_state?: string;
  status: string;
  next_bot_state?: string;
  user_id?: string;
  readonly chat_id: number;
  current_bot_state: string;
  readonly message_id: number;
}
