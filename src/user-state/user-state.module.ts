import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserState, UserStateSchema } from './user-state.schema';
import { UserStateService } from './user-state.service';

@Module({
  imports: [
    MongooseModule.forFeature([ { name: UserState.name, schema: UserStateSchema } ]),
  ],
  providers: [ UserStateService ],
  exports: [ UserStateService ],
})
export class UserStateModule{}