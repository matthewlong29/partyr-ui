import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { BehaviorSubject, concat, Subscription } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { map } from 'rxjs/operators';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../utils/confirmation-dialog/confirmation-dialog.component';
import { AppFns } from 'src/app/classes/utils/app-fns';
import { FormBuilder } from '@angular/forms';
import { BlackHandRoleObject } from 'src/app/classes/models/black-hand/black-hand-role-object';
import { BlackHandService } from 'src/app/services/black-hand.service';
import { BlackHandRoleRespObject } from 'src/app/classes/models/black-hand/black-hand-role-resp-object';
import { SPRITE_MAP } from 'src/app/classes/constants/sprite-map';

interface RoomPlayerContext {
  isHost: boolean;
  isCurrUser: boolean;
  isReady: boolean;
  isInRoom: boolean;
}

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomName = this.route.snapshot.paramMap.get('roomName');
  roomDetails = new BehaviorSubject<LobbyRoom>(undefined);
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  durationOpts = new Array(5).fill(0).map((_, index: number) => index + 3);
  roles = new BehaviorSubject<BlackHandRoleObject[]>([]);
  spriteMap = SPRITE_MAP;

  settingsForm = this.fb.group({
    allowPref: this.fb.control(true),
    dayDurationCtrl: this.fb.control(5),
    nightDurationCtrl: this.fb.control(3)
  });

  subs: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly lobbySvc: LobbyService,
    readonly userSvc: UserService,
    readonly dialog: MatDialog,
    readonly fb: FormBuilder,
    readonly bhSvc: BlackHandService
  ) {}

  ngOnInit() {
    this.subs.push(this.getCurrUser());
    this.subs.push(this.subToRoomChanges());
    this.subs.push(this.getRoles());
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  /** subToRoomChanges
   * @desc get history of and watch changes to the state of available rooms
   */
  subToRoomChanges(): Subscription {
    return concat(
      this.lobbySvc.getAvailableRooms(),
      this.lobbySvc.watchAvailableRooms()
    )
      .pipe(
        map((rooms: LobbyRoom[]) =>
          rooms.find((room: LobbyRoom) => room.gameRoomName === this.roomName)
        )
      )
      .subscribe((foundRoom?: LobbyRoom) => {
        this.roomDetails.next(foundRoom);
      });
  }

  /** backToLobby
   * @desc navigate to the page with all the available rooms
   */
  backToLobby(): void {
    const paths: string[] = this.route.snapshot.pathFromRoot[1].url.map(
      (segment: UrlSegment) => segment.path
    );
    this.router.navigateByUrl(`/${paths[0]}/${paths[1]}`);
  }

  /** getPlayersInRoom
   * @desc return joined list of ready and unready players in room
   */
  getPlayersInRoom(): string[] {
    return AppFns.getAllPlayersInRoom(this.roomDetails.getValue());
  }

  /** getCurrUser
   * @desc get and set the class variable to the current user
   */
  getCurrUser(): Subscription {
    return this.userSvc
      .getCurrentUser()
      .subscribe((user: PartyrUser) => this.currUser.next(user));
  }

  getRoles(): Subscription {
    return this.bhSvc
      .getBlackHandRoles()
      .subscribe((rolesResp: BlackHandRoleRespObject) => {
        const roles: BlackHandRoleObject[] = [
          ...rolesResp.BlackHand,
          ...rolesResp.Monster,
          ...rolesResp.Townie
        ];

        this.roles.next(roles);
      });
  }

  /** getPlayerContext
   * @desc returns object containing info about the username in the context of this room
   */
  getPlayerContext(username: string): RoomPlayerContext {
    const currUser: PartyrUser | undefined = this.currUser.getValue();
    const room: LobbyRoom | undefined = this.roomDetails.getValue();
    const isHost = room && username === room.hostUsername;
    const isCurrUser = currUser && username === currUser.username;
    const isReady = room && room.playersReady.includes(username);
    const isInRoom =
      room && AppFns.getAllPlayersInRoom(room).includes(username);
    return { isHost, isCurrUser, isReady, isInRoom };
  }

  /** deleteRoom
   * @desc delete the room with the specified name
   */
  deleteRoom(): void {
    const room: LobbyRoom | undefined = this.roomDetails.getValue();
    if (room) {
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: 'Are you sure you want to delete this room?'
        })
        .afterClosed()
        .subscribe((confirm: boolean) => {
          if (confirm) {
            this.lobbySvc.deleteRoom(room.gameRoomName);
            this.backToLobby();
          }
        });
    }
  }

  /** toggleReady
   * @desc toggle a user's ready state to start the game
   */
  toggleReady() {
    this.lobbySvc.toggleReadyStatus(
      this.currUser.getValue(),
      this.roomDetails.getValue()
    );
  }
}
