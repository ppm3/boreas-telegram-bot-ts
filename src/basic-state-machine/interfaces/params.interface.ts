import { UserState } from "src/user-state/user-state.schema";

export interface IParams {
    user?: any;
    state?: string;
    nextState?: string;
    userState?: UserState;
    chatData?: any;
}