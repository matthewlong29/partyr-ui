import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { LobbyRoom } from '../classes/models/lobby-room';
import { asap } from 'rxjs/internal/scheduler/asap';
import { AVAILABLE_ROOMS } from 'src/assets/mock-data/available-rooms';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor() {}

  getAvailableRooms(): Observable<LobbyRoom[]> {
    return scheduled([AVAILABLE_ROOMS], asap);
  }
}
