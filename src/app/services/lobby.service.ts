import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LobbyRoom, lobbyRoomGuard } from '../classes/models/shared/lobby-room';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { URLStore } from '../classes/constants/url-store';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { PartyrUser } from '../classes/models/shared/PartyrUser';
import { AppFns } from '../classes/utils/app-fns';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(readonly wsSvc: WebsocketService, readonly http: HttpClient) {}

  /** createRoom
   * @desc create a new lobby room and become the host
   */
  createRoom(game: string, roomName: string, hostName: string): void {
    this.wsSvc.publish(WsBrokerStore.CREATE_LOBBY_ROOM, {
      roomName,
      gameName: game,
      username: hostName
    });
  }

  /** joinRoom
   * @desc join a specified lobby room
   */
  joinRoom(username: string, roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.JOIN_LOBBY_ROOM, { username, roomName });
  }

  /** leaveRoom
   * @desc leave a specified lobby room
   */
  leaveRoom(username: string, roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.LEAVE_LOBBY_ROOM, { username, roomName });
  }

  /** deleteRoom
   * @desc delete a specified lobby room
   */
  deleteRoom(roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.DELETE_LOBBY_ROOM, { roomName });
  }

  /** watchAvailableRooms
   * @desc listen to changes in available lobby rooms with websocket
   */
  watchAvailableRooms(): Observable<LobbyRoom[]> {
    return this.wsSvc.watch<LobbyRoom[]>(WsBrokerStore.LOBBY_ROOMS_QUEUE).pipe(
      map((rooms: LobbyRoom[]) => {
        if (rooms.every((room: LobbyRoom) => lobbyRoomGuard(room))) {
          return rooms;
        }
        console.error('ERROR: Type guard failed for watchAvailableRooms()');
        return [];
      })
    );
  }

  /** getAvailableRooms
   * @desc http call to get a static list of current rooms available
   */
  getAvailableRooms(): Observable<LobbyRoom[]> {
    return this.http.get<LobbyRoom[]>(URLStore.GET_AVAILABLE_ROOMS).pipe(
      map((rooms: LobbyRoom[]) => {
        if (rooms.every((room: LobbyRoom) => lobbyRoomGuard(room))) {
          return rooms;
        }
        console.error('ERROR: Type guard failed for getAvailableRooms()');
        return [];
      })
    );
  }

  /** toggleReadyStatus
   * @desc toggle ready status for the currently logged in user in the lobby room
   */
  toggleReadyStatus(user?: PartyrUser, room?: LobbyRoom) {
    if (user && room) {
      const username = user.username;
      const roomName = room.gameRoomName;
      if (AppFns.getAllPlayersInRoom(room).includes(username)) {
        // TODO: REMOVE THIS CODE BELOW USED ONLY FOR TESTING
        room.playersNotReady.forEach((player: string) => {
          console.log('Toggling for ', player);
          this.wsSvc.publish(WsBrokerStore.TOGGLE_READY_STATUS, {
            username: player,
            roomName
          });
        });
        // END OF TEST CODE

        // TODO: UNCOMMENT THIS WHEN TESTING IS COMPLETE
        // this.wsSvc.publish(WsBrokerStore.TOGGLE_READY_STATUS, {
        //   username,
        //   roomName
        // });
      }
    }
  }
}
