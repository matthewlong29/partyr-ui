import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URLStore } from '../classes/constants/url-store';
import { BlackHandRoleRespObject } from '../classes/models/black-hand/black-hand-role-resp-object';
import { LobbyRoom } from '../classes/models/lobby-room';

@Injectable({
  providedIn: 'root'
})
export class BlackHandService {
  constructor(readonly http: HttpClient) {}

  getBlackHandRoles(): Observable<BlackHandRoleRespObject> {
    return this.http.get<BlackHandRoleRespObject>(URLStore.GET_BH_ROLES);
  }
}
