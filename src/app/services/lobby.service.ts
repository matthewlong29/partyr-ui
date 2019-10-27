import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { LobbyRoom } from '../classes/models/lobby-room';
import { asap } from 'rxjs/internal/scheduler/asap';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/ws-broker-store';
import { URLStore } from '../classes/url-store';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(readonly wsSvc: WebsocketService, readonly http: HttpClient) {}

  connectToLobbies(): Observable<any> {
    return this.wsSvc.watch(WsBrokerStore.LOBBY_ROOMS_QUEUE);
  }

  createRoom(room: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_CREATE, room);
  }

  getAvailableRooms(roomName: string): Observable<LobbyRoom[]> {
    return this.http
      .get<LobbyRoom[]>(`${URLStore.GET_AVAILABLE_ROOMS}/${roomName}`)
      .pipe(
        catchError((err: any) => {
          console.error(err);
          return scheduled([[]], asap);
        })
      );
  }
}
