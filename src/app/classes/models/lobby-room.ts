import { AppFns } from '../utils/app-fns';

export interface LobbyRoom {
  gameRoomName: string;
  gameName: string;
  hostEmail: string;
  playersReady: string[];
  playersNotReady: string[];
  numberOfPlayers: number;
  gameStarted: boolean;
  gameStartTime: string;
  gameEndTime: string;
}

export const lobbyRoomGuard = (obj: any): boolean => {
  return AppFns.typeGuard(obj, [
    'gameRoomName',
    'gameName',
    'hostEmail',
    'playersReady',
    'playersNotReady',
    'numberOfPlayers',
    'gameStarted',
    'gameStartTime',
    'gameEndTime'
  ]);
};
