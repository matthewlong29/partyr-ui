import { Component, OnInit } from '@angular/core';
import { AutoTableColumn } from 'src/app/classes/models/auto-table-column';
import { BehaviorSubject, Observable, concat } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { LobbyService } from 'src/app/services/lobby.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { RoomCreatorComponent } from './room-creator/room-creator.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { GameObject } from 'src/app/classes/models/game-object';
import { GamesService } from 'src/app/services/games.service';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';

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
  availableRooms = new BehaviorSubject<LobbyRoom[]>([]);
  currUser: PartyrUser;

  constructor(
    readonly lobbySvc: LobbyService,
    readonly gameSvc: GamesService,
    readonly userSvc: UserService,
    readonly route: ActivatedRoute,
    readonly dialog: MatDialog,
    readonly snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.userSvc
      .getCurrentUser()
      .subscribe((currUser: PartyrUser) => (this.currUser = currUser));
    this.getGameDetails().subscribe();
    concat(this.getAvailableRooms(), this.watchAvailableRooms()).subscribe();
  }

  /** watchAvailableRooms
   * @desc connect to websocket and listen for changes in available lobby rooms
   */
  watchAvailableRooms(): Observable<LobbyRoom[]> {
    return this.lobbySvc
      .watchAvailableRooms()
      .pipe(tap((rooms: LobbyRoom[]) => this.availableRooms.next(rooms)));
  }

  /** getAvailableRooms
   * @desc get all lobby rooms available for this game
   */
  getAvailableRooms(): Observable<LobbyRoom[]> {
    return this.lobbySvc
      .getAvailableRooms()
      .pipe(tap((rooms: LobbyRoom[]) => this.availableRooms.next(rooms)));
  }

  /** getGameDetails
   * @desc get the details associated with the specified game
   */
  getGameDetails(): Observable<GameObject> {
    return this.gameSvc.getGameDetails(this.gameName).pipe(
      tap((gameDetails: GameObject) => {
        this.maxPlayersPerGame = gameDetails.maxNumberOfPlayers;
      })
    );
  }

  /** openRoomCreator
   * @desc open dialog to select options for creating a room
   */
  openRoomCreator(): void {
    if (this.gameName) {
      this.dialog.open(RoomCreatorComponent, {
        data: this.gameName
      });
    }
  }

  /** joinRoom
   * @desc attempt to join a room if not already currently a part of one and the room isn't full
   */
  joinRoom(room: LobbyRoom): void {
    const currRoom: LobbyRoom | undefined = this.currentlyOccupiedRoom();
    const snackBarOptions: any = { duration: 2000 };
    if (currRoom) {
      const alertMsg = `Already a part of room ${currRoom.gameRoomName}!`;
      this.snackBar.open(alertMsg, null, snackBarOptions);
      return;
    }

    if (room.numberOfPlayers >= this.maxPlayersPerGame) {
      const alertMsg = `${room.gameRoomName} is full`;
      this.snackBar.open(alertMsg, null, snackBarOptions);
      return;
    }

    this.lobbySvc.joinRoom(this.currUser.email, room.gameRoomName);
  }

  /** leaveRoom
   * @desc leave the specified room
   */
  leaveRoom(room: LobbyRoom): void {
    if (this.currUser) {
      this.lobbySvc.leaveRoom(this.currUser.email, room.gameRoomName);
    } else {
      console.error('Current user not found');
    }
  }

  /** isPlayerInRoom
   * @desc returns if a player is a member of the given room
   */
  isPlayerInRoom(room: LobbyRoom): boolean {
    if (this.currUser) {
      return room.players.some(
        (playerEmail: string) => playerEmail === this.currUser.email
      );
    }
    return false;
  }

  /** currentlyOccupiedRoom
   * @desc returns the room the user is currently in if any
   */
  currentlyOccupiedRoom(): LobbyRoom | undefined {
    return this.availableRooms.getValue().find((room: LobbyRoom) => {
      return room.players
        .map((player: string) => player.toLowerCase())
        .includes(this.currUser.email.toLowerCase());
    });
  }
}
