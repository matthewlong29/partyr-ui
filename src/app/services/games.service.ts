import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameObject } from '../classes/models/game-object';
import { URLStore } from '../classes/constants/url-store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  constructor(readonly http: HttpClient) {}

  getAllGames(): Observable<GameObject[]> {
    return this.http.get<GameObject[]>(URLStore.GET_ALL_GAMES_URL);
  }

  getGameDetails(gameName: string): Observable<GameObject> {
    return this.http.get<GameObject>(
      `${URLStore.GET_GAME_DETAILS_URL}/${gameName}`
    );
  }
}
