import { LobbyRoom } from '../models/lobby-room';

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
    return room ? [...room.playersReady, ...room.playersNotReady] : [];
  }
}
