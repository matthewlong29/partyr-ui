import { AppFns } from 'src/app/classes/utils/app-fns';

export interface LobbyRoom {
  gameRoomName: string;
  gameName: string;
  hostUsername: string;
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
    'hostUsername',
    'playersReady',
    'playersNotReady',
    'numberOfPlayers',
    'gameStarted',
    'gameStartTime',
    'gameEndTime'
  ]);
};
