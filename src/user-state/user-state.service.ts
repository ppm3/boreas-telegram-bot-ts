import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserState } from './user-state.schema';
import { UpdateuserState } from './dtos/update-user-state';
import { CreateUserStateDto } from './dtos/create-user-state';
import { subtractMinusFromDate } from '../helpers/substract-minus-from-date.helper';

@Injectable()
export class UserStateService {
  private minutes: number = 5;
  constructor(
    @InjectModel(UserState.name)
    private readonly userStateModel: Model<UserState>,
  ) { }

  async insert(userStateDto: CreateUserStateDto): Promise<UserState> {
    const botState = await this.userStateModel.create(userStateDto);
    return botState;
  }

  async findLastStateWithIds(chatId: number, userId: string): Promise<UserState[]> {
    return await this.userStateModel
      .find({
        chat_id: chatId,
        user_id: userId,
        created_at: {
          $gte: subtractMinusFromDate(new Date(), this.minutes),
        },
      })
      .sort({ created_at: -1 })
      .limit(1);
  }

  async findLastState(chatId: number): Promise<UserState[]> {
    return await this.userStateModel
      .find({
        chat_id: chatId,
        created_at: {
          $gte: subtractMinusFromDate(new Date(), this.minutes),
        },
      })
      .sort({ created_at: -1 })
      .limit(1);
  }

  async updateOne(userStateId: string, params?: UpdateuserState): Promise<UserState> {
    const updateState = await this.userStateModel
      .findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userStateId) },
        params,
      )
      .exec();
    return updateState;
  }
}
