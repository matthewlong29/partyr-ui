import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { BehaviorSubject, concat, Subscription, combineLatest, Observable, scheduled, merge } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { map, switchMap, catchError, tap, skipWhile, take, debounceTime } from 'rxjs/operators';
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
import { BlackHandPlayer } from 'src/app/classes/models/shared/black-hand/black-hand-player';

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
  generalGameInfo = new BehaviorSubject<GameObject>(undefined);
  gameDetails = new BehaviorSubject<BlackHandDetails>(undefined);
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
    this.subs.push(this.getRoles().subscribe(), this.setUpRoom().subscribe());
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  /** setUpRoom 
   * @desc get the current user and room details before subscribing to other observables
   */
  setUpRoom(): Observable<any> {
    return this.userSvc
      .getCurrentUser()
      .pipe(
        skipWhile((currUser: PartyrUser) => !currUser || !currUser.username),
        take(1),
        tap((currUser: PartyrUser) => this.currUser.next(currUser)),
        switchMap(() =>
          merge(
            this.roomDetails,
            this.watchContextUpdates(),
            this.watchForPlayerQuotas(),
            this.watchGameDetails(),
            this.watchDisplayNameCtrlChanges(),
            this.subToSettingsForm()
          )
        )
      );
  }

  /** watchDisplayNameCtrlChanges
   * @desc updates the display name for the game on valid form change
   */
  watchDisplayNameCtrlChanges(): Observable<any> {
    return this.displayNameCtrl.valueChanges.pipe(
      debounceTime(1000),
      tap((displayName: string) => {
        if (this.displayNameCtrl.valid) {
          this.bhSvc.updateDisplayName(
            this.currUser.getValue().username,
            displayName,
            this.roomDetails.getValue().gameRoomName
          );
        }
      })
    );
  }

  /** subToSettingsForm
   * @desc subscribe to form changes and push to the websocket accordingly
   */
  subToSettingsForm(): Observable<any> {
    return this.settingsForm.valueChanges.pipe(
      debounceTime(1000),
      tap((formVals: WaitingRoomSettingsForm) => {
        const currUser: PartyrUser | undefined = this.currUser.getValue();
        const roomDetails: LobbyRoom | undefined = this.roomDetails.getValue();
        if (currUser && roomDetails && currUser.username === roomDetails.hostUsername) {
          console.log(formVals);
        }
      })
    );
  }

  /** grantPrivileges
   * @desc grant specific room privileges depending on if the user is the host
   */
  grantPrivileges(): void {
    const currUser: PartyrUser = this.currUser.getValue();
    const room: LobbyRoom = this.roomDetails.getValue();
    const userIsHost = room && currUser && currUser.username === room.hostUsername;
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

  /** getUserDisplayName 
   * @desc get the display name for a given username
   */
  getUserDisplayName(username: string): string {
    const blackHandPlayer = AppFns.findPlayerInBlackHandGame(username, this.gameDetails.getValue());
    return (blackHandPlayer && blackHandPlayer.displayName !== 'null' && blackHandPlayer.displayName) || username;
  }

  /** watchContextUpdates
   * @desc updates the player privileges and settings for any room or current user change
   */
  watchContextUpdates(): Observable<any> {
    // Observable that monitors any changes to the Lobby Room
    const watchRoomUpdates: () => Observable<LobbyRoom> = () =>
      concat(this.lobbySvc.getAvailableRooms(), this.lobbySvc.watchAvailableRooms()).pipe(
        map((rooms: LobbyRoom[]) => rooms.find((room: LobbyRoom) => room.gameRoomName === this.roomName))
      );

    return combineLatest([ watchRoomUpdates(), this.gameSvc.getGameDetails(GameStore.BLACK_HAND_NAME) ]).pipe(
      tap(([ foundRoom, gameDetails ]: [LobbyRoom, GameObject]) => {
        console.log('Next found room', foundRoom);
        this.roomDetails.next(foundRoom);
        this.generalGameInfo.next(gameDetails);
        const currUser = this.currUser.getValue();
        // if (JSON.stringify(currUser) !== JSON.stringify(newCurrUser)) {
        //   this.displayNameCtrl.setValue(newCurrUser.username);
        // }

        this.grantPrivileges();
        this.showHideStartButton();
      })
    );
  }

  /** watchGameDetails 
   * @desc watch updates to the game settings and ready states
   */
  watchGameDetails(): Observable<BlackHandDetails> {
    return combineLatest([ this.currUser, this.roomDetails ]).pipe(
      skipWhile(
        ([ currUser, room ]: [PartyrUser, LobbyRoom]) => !currUser || !currUser.username || !room || !room.gameRoomName
      ),
      take(1),
      switchMap(([ currUser, room ]: [PartyrUser, LobbyRoom]) =>
        concat(this.bhSvc.getGameDetails(room.gameRoomName), this.bhSvc.watchGameDetails()).pipe(
          tap((details: BlackHandDetails) => {
            this.gameDetails.next(details);
            const playerData: BlackHandPlayer = AppFns.findPlayerInBlackHandGame(currUser.username, details);
            if (this.displayNameCtrl.value !== playerData.displayName) {
              this.displayNameCtrl.setValue(
                (playerData.displayName !== 'null' && playerData.displayName) || currUser.username
              );
            }
            if (details.gameStartTime) {
              this.navigateToGamePage();
            }
          })
        )
      )
    );
  }

  /** watchForPlayerQuotas
   * @desc update the faction quota every time the room details change
   */
  watchForPlayerQuotas(): Observable<any> {
    return this.roomDetails.pipe(
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
      }),
      tap((quotas: BlackHandNumberOfPlayers) => {
        this.factionQuotas.next(quotas);
      })
    );
  }

  /** getRoles
   * @desc get all the roles included in the Black Hand game
   */
  getRoles(): Observable<any> {
    return this.bhSvc.getBlackHandRoles().pipe(
      tap((rolesResp: BlackHandRoleRespObject) => {
        const roles: BlackHandRoleObject[] = [ ...rolesResp.BlackHand, ...rolesResp.Monster, ...rolesResp.Townie ];
        this.roles.next(roles);
      })
    );
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
    const currUser = this.currUser.getValue();
    const room = this.roomDetails.getValue();
    const username = currUser && currUser.username;
    const roomName = room && room.gameRoomName;
    if (username && roomName) {
      this.factionPref.next(faction);
      this.bhSvc.selectPreferredFaction(username, roomName, faction);
    }
  }

  /** showHideStartButton
   * @desc show button to start game if all players ready and the user is host
   */
  showHideStartButton(): void {
    // Cached objects
    const currUser: PartyrUser = this.currUser.getValue();
    const room: LobbyRoom = this.roomDetails.getValue();
    const gameDetails: GameObject = this.generalGameInfo.getValue();

    // Intermediary values used for calculations
    const minPlayers: number = gameDetails.minNumberOfPlayers;
    const maxPlayers: number = gameDetails.maxNumberOfPlayers;
    const notReadyCount: number = room.playersNotReady.length;
    const readyCount: number = room.playersReady.length;
    const totalPlayers: number = notReadyCount + readyCount;

    // Conditional variables used to determine if view should show start button
    const isHost: boolean = currUser && currUser.username === room.hostUsername;
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

  navigateToGamePage(): void {
    this.router.navigateByUrl(
      `session/${this.generalGameInfo.getValue().gameName}/${this.roomDetails.getValue().gameRoomName}`
    );
  }
}
