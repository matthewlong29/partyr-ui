import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { URLStore } from 'src/app/classes/url-store';

@Component({
  selector: 'app-game-select',
  templateUrl: './game-select.component.html',
  styleUrls: ['./game-select.component.scss']
})
export class GameSelectComponent implements OnInit {
  constructor(readonly router: Router) {}

  ngOnInit() {}

  enterBlackHandLobby(): void {
    this.router.navigate([URLStore.LOBBY_URL]);
  }
}
