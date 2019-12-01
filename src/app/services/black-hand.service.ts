import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URLStore } from '../classes/constants/url-store';
import { BlackHandRoleRespObject } from '../classes/models/shared/black-hand/black-hand-role-resp-object';
import { LobbyRoom } from '../classes/models/shared/lobby-room';
import { BlackHandNumberOfPlayers } from '../classes/models/shared/black-hand/black-hand-number-of-players';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { BlackHandDetails } from '../classes/models/shared/black-hand/black-hand-details';

@Injectable({
  providedIn: 'root'
})
export class BlackHandService {
  constructor(readonly http: HttpClient, readonly wsSvc: WebsocketService) {}

  getBlackHandRoles(): Observable<BlackHandRoleRespObject> {
    return this.http.get<BlackHandRoleRespObject>(URLStore.GET_BH_ROLES);
  }

  getBlackHandRoleTotals(playerTotal: number): Observable<any> {
    return this.http.get<BlackHandNumberOfPlayers>(`${URLStore.GET_BH_FACTION_QUOTA}/${playerTotal}`);
  }

  startGame(roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.START_BLACK_HAND_GAME, { roomName });
  }

  /** getGameDetails 
   * @desc http request for current game details status
   */
  getGameDetails(roomName: string): Observable<BlackHandDetails> {
    return this.http.get<BlackHandDetails>(`${URLStore.GET_BH_GAME_DETAILS}/${roomName}`);
  }

  /** watchGameDetails
   * @desc watch changes to game details status through websocket
   */
  watchGameDetails(): Observable<BlackHandDetails> {
    return this.wsSvc.watch(WsBrokerStore.BH_GAME_DETAILS_BROKER);
  }
}
