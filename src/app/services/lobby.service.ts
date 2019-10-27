import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { LobbyRoom } from '../classes/models/lobby-room';
import { asap } from 'rxjs/internal/scheduler/asap';
import { AVAILABLE_ROOMS } from 'src/assets/mock-data/available-rooms';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/ws-broker-store';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(readonly wsSvc: WebsocketService) {}

  connectToLobbies(): Observable<any> {
    return this.wsSvc.watch(WsBrokerStore.LOBBY_ROOMS_QUEUE);
  }

  createRoom(room: string): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_ROOMS_CREATE, room);
  }

  getAvailableRooms(): Observable<LobbyRoom[]> {
    return scheduled([AVAILABLE_ROOMS], asap);
  }
}
