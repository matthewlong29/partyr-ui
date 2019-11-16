import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { URLStore } from 'src/app/classes/constants/url-store';
import { GamesService } from 'src/app/services/games.service';
import { GameObject } from 'src/app/classes/models/shared/game-object';

@Component({
  selector: 'app-game-select',
  templateUrl: './game-select.component.html',
  styleUrls: ['./game-select.component.scss']
})
export class GameSelectComponent implements OnInit {
  gameList: GameObject[];

  constructor(readonly router: Router, readonly gameSvc: GamesService) {}

  ngOnInit() {
    this.gameSvc
      .getAllGames()
      .subscribe((games: GameObject[]) => (this.gameList = games));
  }

  enterLobby(gameName: string): void {
    this.router.navigate([`${URLStore.LOBBY_URL}/${gameName}`]);
  }
}
