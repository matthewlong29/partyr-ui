import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URLStore } from '../classes/constants/url-store';
import { BlackHandRoleRespObject } from '../classes/models/shared/black-hand/black-hand-role-resp-object';
import { LobbyRoom } from '../classes/models/shared/lobby-room';
import { BlackHandNumberOfPlayers } from '../classes/models/shared/black-hand/black-hand-number-of-players';

@Injectable({
  providedIn: 'root'
})
export class BlackHandService {
  constructor(readonly http: HttpClient) {}

  getBlackHandRoles(): Observable<BlackHandRoleRespObject> {
    return this.http.get<BlackHandRoleRespObject>(URLStore.GET_BH_ROLES);
  }

  getBlackHandRoleTotals(playerTotal: number): Observable<any> {
    return this.http.get<BlackHandNumberOfPlayers>(
      `${URLStore.GET_BH_FACTION_QUOTA}/${playerTotal}`
    );
  }
}
