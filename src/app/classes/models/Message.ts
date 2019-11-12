import { AppFns } from '../utils/app-fns';

export class Message {
  constructor(
    public content: string,
    public username: string,
    public timeOfMessage: string
  ) {}
}

export const messageTypeGuard = (obj: any) => {
  return AppFns.typeGuard(obj, ['content', 'username', 'timeOfMessage']);
};
