import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { BehaviorSubject, concat, Subscription, combineLatest, Observable, scheduled } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { map, switchMap, catchError } from 'rxjs/operators';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../utils/confirmation-dialog/confirmation-dialog.component';
import { AppFns } from 'src/app/classes/utils/app-fns';
import { FormBuilder, Validators } from '@angular/forms';
import { BlackHandRoleObject } from 'src/app/classes/models/shared/black-hand/black-hand-role-object';
import { BlackHandService } from 'src/app/services/black-hand.service';
import { BlackHandRoleRespObject } from 'src/app/classes/models/shared/black-hand/black-hand-role-resp-object';
import { RoomPlayerContext } from 'src/app/classes/models/frontend/room-player-context';
import { WaitingRoomSettingsForm } from 'src/app/classes/models/frontend/forms/waiting-room-settings-form';
import { Faction } from 'src/app/classes/constants/type-aliases';
import { AppRegex } from 'src/app/classes/constants/app-regex';
import { BlackHandNumberOfPlayers } from 'src/app/classes/models/shared/black-hand/black-hand-number-of-players';
import { asap } from 'rxjs/internal/scheduler/asap';
import { GamesService } from 'src/app/services/games.service';
import { GameObject } from 'src/app/classes/models/shared/game-object';
import { GameStore } from 'src/app/classes/constants/game-store';
import { BlackHandDetails } from 'src/app/classes/models/shared/black-hand/black-hand-details';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: [ './waiting-room.component.scss' ]
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomName = this.route.snapshot.paramMap.get('roomName');
  roomDetails = new BehaviorSubject<LobbyRoom>(undefined);
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  durationOpts = new Array(5).fill(0).map((_, index: number) => index + 3);
  roles = new BehaviorSubject<BlackHandRoleObject[]>([]);
  factionPref = new BehaviorSubject<Faction>(undefined);
  factionQuotas = new BehaviorSubject<BlackHandNumberOfPlayers>(undefined);
  gameDetails = new BehaviorSubject<GameObject>(undefined);
  showStartButton = new BehaviorSubject<boolean>(false);
  displayNameCtrl = this.fb.control('', [ Validators.pattern(AppRegex.DISPLAY_NAME) ]);

  settingsForm = this.fb.group({
    allowFactionPrefCtrl: this.fb.control(true),
    dayDurationCtrl: this.fb.control(5),
    nightDurationCtrl: this.fb.control(5),
    allowMediaCtrl: this.fb.control(true)
  } as WaitingRoomSettingsForm);

  subs: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly lobbySvc: LobbyService,
    readonly userSvc: UserService,
    readonly dialog: MatDialog,
    readonly fb: FormBuilder,
    readonly bhSvc: BlackHandService,
    readonly gameSvc: GamesService
  ) {}

  ngOnInit() {
    this.subs.push(this.watchForPlayerQuotas(), this.watchGameDetails(), this.watchContextUpdates(), this.getRoles());
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  /** subToSettingsForm
   * @desc subscribe to form changes and push to the websocket accordingly
   */
  subToSettingsForm(): Subscription {
    return this.settingsForm.valueChanges.subscribe((formVals: WaitingRoomSettingsForm) => {
      const currUser: PartyrUser | undefined = this.currUser.getValue();
      const roomDetails: LobbyRoom | undefined = this.roomDetails.getValue();
      if (currUser && roomDetails && currUser.username === roomDetails.hostUsername) {
        console.log(formVals);
      }
    });
  }

  /** grantPrivileges
   * @desc grant specific room privileges depending on if the user is the host
   */
  grantPrivileges(): void {
    const currUser: PartyrUser = this.currUser.getValue();
    const room: LobbyRoom = this.roomDetails.getValue();
    const userIsHost = currUser.username === room.hostUsername;
    this.settingsForm[userIsHost ? 'enable' : 'disable']();
  }

  /** backToLobby
   * @desc navigate to the page with all the available rooms
   */
  backToLobby(): void {
    const paths: string[] = this.route.snapshot.pathFromRoot[1].url.map((segment: UrlSegment) => segment.path);
    this.router.navigateByUrl(`/${paths[0]}/${paths[1]}`);
  }

  /** getPlayersInRoom
   * @desc return joined list of ready and unready players in room
   */
  getPlayersInRoom(): string[] {
    return AppFns.getAllPlayersInRoom(this.roomDetails.getValue());
  }

  /** watchContextUpdates
   * @desc updates the player privileges and settings for any room or current user change
   */
  watchContextUpdates(): Subscription {
    // Observable that monitors any changes to the Lobby Room
    const watchRoomUpdates: () => Observable<LobbyRoom> = () =>
      concat(this.lobbySvc.getAvailableRooms(), this.lobbySvc.watchAvailableRooms()).pipe(
        map((rooms: LobbyRoom[]) => rooms.find((room: LobbyRoom) => room.gameRoomName === this.roomName))
      );

    return combineLatest([
      this.userSvc.getCurrentUser(),
      watchRoomUpdates(),
      this.gameSvc.getGameDetails(GameStore.BLACK_HAND_NAME)
    ]).subscribe(([ newCurrUser, foundRoom, gameDetails ]: [PartyrUser, LobbyRoom, GameObject]) => {
      this.roomDetails.next(foundRoom);
      this.gameDetails.next(gameDetails);
      const currUser = this.currUser.getValue();
      if (JSON.stringify(currUser) !== JSON.stringify(newCurrUser)) {
        this.displayNameCtrl.setValue(newCurrUser.username);
      }
      this.currUser.next(newCurrUser);
      this.grantPrivileges();
      this.showHideStartButton();
    });
  }

  /** watchGameDetails 
   * @desc watch updates to the game settings and ready states
   */
  watchGameDetails(): Subscription {
    return this.bhSvc.watchGameDetails().subscribe((details: BlackHandDetails) => {
      console.log('Game details', details);
      if (details.gameStartTime) {
        this.enterGame();
      }
    });
  }

  /** watchForPlayerQuotas
   * @desc update the faction quota every time the room details change
   */
  watchForPlayerQuotas(): Subscription {
    return this.roomDetails
      .pipe(
        switchMap((room: LobbyRoom) => {
          const totalPlayers = AppFns.getAllPlayersInRoom(room).length;
          if (totalPlayers) {
            return this.bhSvc.getBlackHandRoleTotals(totalPlayers);
          }
          return scheduled([ undefined ], asap);
        }),
        catchError((err: any) => {
          console.error(err);
          return scheduled([ undefined ], asap);
        })
      )
      .subscribe((quotas: BlackHandNumberOfPlayers) => {
        this.factionQuotas.next(quotas);
        console.log(quotas);
      });
  }

  /** getRoles
   * @desc get all the roles included in the Black Hand game
   */
  getRoles(): Subscription {
    return this.bhSvc.getBlackHandRoles().subscribe((rolesResp: BlackHandRoleRespObject) => {
      const roles: BlackHandRoleObject[] = [ ...rolesResp.BlackHand, ...rolesResp.Monster, ...rolesResp.Townie ];

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
    const isInRoom = room && AppFns.getAllPlayersInRoom(room).includes(username);
    return { username, isHost, isCurrUser, isReady, isInRoom };
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
    this.lobbySvc.toggleReadyStatus(this.currUser.getValue(), this.roomDetails.getValue());
  }

  /** toggleFactionPref
   * @desc change the user's preferred faction to play
   */
  toggleFactionPref(faction?: Faction) {
    this.factionPref.next(faction);
  }

  /** showHideStartButton
   * @desc show button to start game if all players ready and the user is host
   */
  showHideStartButton(): void {
    // Cached objects
    const currUser: PartyrUser = this.currUser.getValue();
    const room: LobbyRoom = this.roomDetails.getValue();
    const gameDetails: GameObject = this.gameDetails.getValue();

    // Intermediary values used for calculations
    const minPlayers: number = gameDetails.minNumberOfPlayers;
    const maxPlayers: number = gameDetails.maxNumberOfPlayers;
    const notReadyCount: number = room.playersNotReady.length;
    const readyCount: number = room.playersReady.length;
    const totalPlayers: number = notReadyCount + readyCount;

    // Conditional variables used to determine if view should show start button
    const isHost: boolean = currUser.username === room.hostUsername;
    const overMin: boolean = totalPlayers >= minPlayers;
    const underMax: boolean = totalPlayers <= maxPlayers;
    const allReady: boolean = !notReadyCount && !!readyCount;

    // TODO: Re-enable these conditionals once the game is ready
    // this.showStartButton.next(isHost && overMin && underMax && allReady);
    this.showStartButton.next(allReady);
  }

  /** startGame
   * @desc send the start game signal to the backend and navigate to the game page
   */
  startGame(): void {
    const room = this.roomDetails.getValue();
    if (room) {
      this.bhSvc.startGame(room.gameRoomName);
    }
  }

  enterGame(): void {
    this.router.navigateByUrl(
      `session/${this.gameDetails.getValue().gameName}/${this.roomDetails.getValue().gameRoomName}`
    );
  }
}
