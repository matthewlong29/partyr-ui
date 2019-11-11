import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import { AutoTableColumn } from 'src/app/classes/models/auto-table-column';
import { BehaviorSubject, Observable, concat } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { LobbyService } from 'src/app/services/lobby.service';
import { tap } from 'rxjs/operators';
import { RoomCreatorComponent } from './room-creator/room-creator.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { GameObject } from 'src/app/classes/models/game-object';
import { GamesService } from 'src/app/services/games.service';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';

const AVAILABLE_ROOMS_COLS: AutoTableColumn[] = [
  new AutoTableColumn('gameRoomName', 'Room'),
  new AutoTableColumn('numberOfPlayers', 'Players'),
  new AutoTableColumn('join', 'Join')
];

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LobbyComponent implements OnInit {
  gameName = this.route.snapshot.paramMap.get('game');
  maxPlayersPerGame = 0;
  availableRoomsCols: AutoTableColumn[] = AVAILABLE_ROOMS_COLS;
  availableRoomsHeaderDefs: string[] = AVAILABLE_ROOMS_COLS.map(
    (col: AutoTableColumn) => col.id
  );
  availableRooms = new BehaviorSubject<LobbyRoom[]>([]);
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  selectedRoom = new BehaviorSubject<LobbyRoom>(undefined);

  @HostListener('click')
  deselectRow(): void {
    this.selectedRoom.next(undefined);
  }

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
      .subscribe((currUser: PartyrUser) => this.currUser.next(currUser));
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
  joinRoom(room: LobbyRoom, event: Event): void {
    event.stopPropagation();
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

    this.lobbySvc.joinRoom(this.currUser.getValue().email, room.gameRoomName);
  }

  /** leaveRoom
   * @desc leave the specified room
   */
  leaveRoom(room: LobbyRoom, event: Event): void {
    event.stopPropagation();
    const currUser: PartyrUser | undefined = this.currUser.getValue();
    if (currUser) {
      this.lobbySvc.leaveRoom(currUser.email, room.gameRoomName);
    } else {
      console.error('Current user not found');
    }
  }

  /** isPlayerInRoom
   * @desc returns if a player is a member of the given room
   */
  isPlayerInRoom(room: LobbyRoom): boolean {
    const currUser: PartyrUser | undefined = this.currUser.getValue();
    if (currUser) {
      const allPlayers: string[] = [
        ...room.playersReady,
        ...room.playersNotReady
      ];
      return allPlayers.some(
        (playerEmail: string) => playerEmail === currUser.email
      );
    }
    return false;
  }

  /** selectRoom
   * @desc select a room to highlight and give the option to enter
   */
  selectRoom(room: LobbyRoom, event: Event): void {
    event.stopPropagation();
    this.selectedRoom.next(room);
  }

  /** currentlyOccupiedRoom
   * @desc returns the room the user is currently in if any
   */
  currentlyOccupiedRoom(): LobbyRoom | undefined {
    return this.availableRooms.getValue().find((room: LobbyRoom) => {
      const allPlayers: string[] = [
        ...room.playersReady,
        ...room.playersNotReady
      ];
      return allPlayers
        .map((player: string) => player.toLowerCase())
        .includes(this.currUser.getValue().email.toLowerCase());
    });
  }

  /** isRoomSelected
   * @desc determines if the input room is the one currently active
   */
  isRoomSelected(room: LobbyRoom) {
    const selectedRoom = this.selectedRoom.getValue();
    return JSON.stringify(room) === JSON.stringify(selectedRoom);
  }
}
