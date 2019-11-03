import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { LobbyRoom } from '../classes/models/lobby-room';
import { asap } from 'rxjs/internal/scheduler/asap';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { URLStore } from '../classes/constants/url-store';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(readonly wsSvc: WebsocketService, readonly http: HttpClient) {}

  watchAvailableRooms(): Observable<LobbyRoom[]> {
    return this.wsSvc.watch<LobbyRoom[]>(WsBrokerStore.LOBBY_ROOMS_QUEUE);
  }

  createRoom(game: string, roomName: string, hostName: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_CREATE, {
      roomName,
      gameName: game,
      email: hostName
    });
  }

  getAvailableRooms(): Observable<LobbyRoom[]> {
    return this.http.get<LobbyRoom[]>(URLStore.GET_AVAILABLE_ROOMS).pipe(
      catchError((err: any) => {
        console.error(err);
        return scheduled([[]], asap);
      })
    );
  }
}
