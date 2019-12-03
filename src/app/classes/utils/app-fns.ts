import { LobbyRoom } from '../models/shared/lobby-room';
import { BlackHandDetails } from '../models/shared/black-hand/black-hand-details';
import { BlackHandPlayer } from '../models/shared/black-hand/black-hand-player';

export class AppFns {
  /** typeGuard
   * @desc checks to see if all the properties are in the object at runtime
   */
  static typeGuard(obj: any, propNames: string[]) {
    return propNames.every((prop: string) => prop in obj);
  }

  /** getAllPlayersInRoom
   * @desc return an array of the players in the room
   */
  static getAllPlayersInRoom(room?: LobbyRoom) {
    return room ? [ ...room.playersReady, ...room.playersNotReady ] : [];
  }

  static findPlayerInBlackHandGame(username: string, gameDetails?: BlackHandDetails) {
    if (!gameDetails) {
      return undefined;
    }
    const allPlayers: BlackHandPlayer[] = [ ...gameDetails.alivePlayers, ...gameDetails.deadPlayers ];
    return allPlayers.find((player: BlackHandPlayer) => player.username === username);
  }
}
