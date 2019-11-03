import { Component, OnInit } from '@angular/core';
import { AutoTableColumn } from 'src/app/classes/models/auto-table-column';
import { BehaviorSubject, Observable, concat } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { LobbyService } from 'src/app/services/lobby.service';
import { tap, switchMap } from 'rxjs/operators';
import { RoomCreatorComponent } from './room-creator/room-creator.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { GameObject } from 'src/app/classes/models/game-object';
import { GamesService } from 'src/app/services/games.service';

const AVAILABLE_ROOMS_COLS: AutoTableColumn[] = [
  new AutoTableColumn('name', 'Room'),
  new AutoTableColumn('fillRatio', 'Players'),
  new AutoTableColumn('join', 'Join')
];

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  gameName = this.route.snapshot.paramMap.get('game');
  maxPlayersPerGame = 0;
  availableRoomsCols: AutoTableColumn[] = AVAILABLE_ROOMS_COLS;
  availableRooms = new BehaviorSubject<any[]>([]);

  constructor(
    readonly lobbySvc: LobbyService,
    readonly gameSvc: GamesService,
    readonly route: ActivatedRoute,
    readonly dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getGameDetails().subscribe();
    concat(this.getAvailableRooms(), this.watchAvailableRooms()).subscribe();
  }

  watchAvailableRooms(): Observable<LobbyRoom[]> {
    return this.lobbySvc
      .watchAvailableRooms()
      .pipe(tap((rooms: LobbyRoom[]) => this.availableRooms.next(rooms)));
  }

  getAvailableRooms(): Observable<LobbyRoom[]> {
    return this.lobbySvc
      .getAvailableRooms()
      .pipe(tap((rooms: LobbyRoom[]) => this.availableRooms.next(rooms)));
  }

  getGameDetails(): Observable<GameObject> {
    return this.gameSvc.getGameDetails(this.gameName).pipe(
      tap((gameDetails: GameObject) => {
        this.maxPlayersPerGame = gameDetails.maxNumberOfPlayers;
      })
    );
  }

  openRoomCreator(): void {
    if (this.gameName) {
      this.dialog.open(RoomCreatorComponent, {
        data: this.gameName
      });
    }
  }
}
