import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LobbyRoom, lobbyRoomGuard } from '../classes/models/lobby-room';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { URLStore } from '../classes/constants/url-store';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(readonly wsSvc: WebsocketService, readonly http: HttpClient) {}

  /** createRoom
   * @desc create a new lobby room and become the host
   */
  createRoom(game: string, roomName: string, hostName: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_CREATE, {
      roomName,
      gameName: game,
      email: hostName
    });
  }

  /** joinRoom
   * @desc join a specified lobby room
   */
  joinRoom(email: string, roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_JOIN, { email, roomName });
  }

  /** leaveRoom
   * @desc leave a specified lobby room
   */
  leaveRoom(email: string, roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_LEAVE, { email, roomName });
  }

  /** deleteRoom
   * @desc delete a specified lobby room
   */
  deleteRoom(roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_LEAVE, { roomName });
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
        throw Error('Type guard failed for watchAvailableRooms()');
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
        throw Error('Type guard failed for getAvailableRooms()');
      })
    );
  }
}
