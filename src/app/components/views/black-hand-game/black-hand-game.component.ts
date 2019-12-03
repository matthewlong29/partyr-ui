import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, concat, combineLatest, Observable, scheduled, merge, from, timer } from 'rxjs';
import { ActivatedRoute, Route } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { map, tap, switchMap, take, skipWhile, catchError, takeWhile, takeUntil, finalize } from 'rxjs/operators';
import { AppFns } from 'src/app/classes/utils/app-fns';
import { WebRtcService } from 'src/app/services/web-rtc.service';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { RTCConnectionMap } from 'src/app/classes/models/shared/rtc-connection-map';
import { asap } from 'rxjs/internal/scheduler/asap';
import { MediaStreamMap } from 'src/app/classes/models/shared/media-stream-map';
import { RemoteStream } from 'src/app/classes/models/shared/remote-stream';
import { BlackHandService } from 'src/app/services/black-hand.service';
import { BlackHandDetails } from 'src/app/classes/models/shared/black-hand/black-hand-details';
import { Moment, Duration } from 'moment';
import * as moment from 'moment';
import { BlackHandPlayer } from 'src/app/classes/models/shared/black-hand/black-hand-player';
import { BlackHandRoleObject } from 'src/app/classes/models/shared/black-hand/black-hand-role-object';
import { FormBuilder, Validators } from '@angular/forms';
import { BlackHandPlayerTurn } from 'src/app/classes/models/shared/black-hand/black-hand-player-turn';
import { BlackHandPhase } from 'src/app/classes/constants/type-aliases';

@Component({
  selector: 'app-black-hand-game',
  templateUrl: './black-hand-game.component.html',
  styleUrls: [ './black-hand-game.component.scss' ]
})
export class BlackHandGameComponent implements OnInit, OnDestroy {
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  room = new BehaviorSubject<LobbyRoom>(undefined);
  players = new BehaviorSubject<string[]>([]);
  hiddenPlayers = new BehaviorSubject<string[]>([]);
  turnStart = new BehaviorSubject<Moment>(undefined);
  turnTimerDisplay = new BehaviorSubject<string>('00:00:00');
  currGameState = new BehaviorSubject<BlackHandDetails>(undefined);
  currPlayerData = new BehaviorSubject<BlackHandPlayer>(undefined);
  turnsElapsed = 0;

  gameStarted = new BehaviorSubject<boolean>(false);

  actionCtrl = this.fb.control(null, Validators.required);
  subs: Subscription[] = [];

  constructor(
    readonly fb: FormBuilder,
    readonly route: ActivatedRoute,
    readonly lobbySvc: LobbyService,
    readonly userSvc: UserService,
    readonly bhSvc: BlackHandService
  ) {}

  ngOnInit() {
    this.subs.push(this.watchRoomContext(), this.getCurrUser().subscribe(), this.watchGameProgress().subscribe());
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  /** getCurrUser 
   * @desc get current user
   */
  getCurrUser(): Observable<any> {
    return this.userSvc.getCurrentUser().pipe(tap((currUser: PartyrUser) => this.currUser.next(currUser)));
  }

  /** watchGameContext
   * @desc subscribe to any updates to the game
   */
  watchRoomContext(): Subscription {
    return concat(this.lobbySvc.getAvailableRooms(), this.lobbySvc.watchAvailableRooms())
      .pipe(
        map((rooms: LobbyRoom[]) =>
          rooms.find((room: LobbyRoom) => room.gameRoomName === this.route.snapshot.paramMap.get('roomName'))
        ),
        tap((room: LobbyRoom) => {
          this.room.next(room);
          this.players.next(AppFns.getAllPlayersInRoom(room));
        })
      )
      .subscribe(() => {});
  }

  /** startGame 
   * @desc start the actual game phases once all streams are confirmed
   */
  startGame(): void {
    console.log('Starting game');
    this.gameStarted.next(true);
    const currGameState = this.currGameState.getValue();
    if (currGameState) {
      this.startTurnTimer(currGameState.settings.lengthOfDay, currGameState.phase).subscribe();
    } else {
      this.currGameState
        .pipe(
          skipWhile((gameState: BlackHandDetails) => !gameState),
          take(1),
          switchMap((gameState: BlackHandDetails) =>
            this.startTurnTimer(gameState.settings.lengthOfDay, gameState.phase)
          ),
          finalize(() => {
            if (this.currGameState.getValue().phase === 'DAY') {
              this.bhSvc.evaluateDay(this.room.getValue().gameRoomName);
            }
          })
        )
        .subscribe();
    }
  }

  startTurnTimer(minutesPerTurn: number, phase: BlackHandPhase): Observable<any> {
    return timer(0, 1).pipe(
      tap(() => {
        if (!this.turnStart.getValue()) {
          this.turnStart.next(moment());
        }
      }),
      map(() => moment.duration(moment().diff(this.turnStart.getValue()))),
      takeWhile((duration: Duration) => {
        return duration.asMinutes() < minutesPerTurn;
      }),
      takeUntil(
        this.currGameState.pipe(skipWhile((gameState: BlackHandDetails) => gameState.playersTurnRemaining.length > 0))
      ),
      tap((duration: Duration) => {
        const timeRemaining = moment.duration(minutesPerTurn * 60 * 1000 - duration.asMilliseconds());
        const formattedTime = `${timeRemaining.minutes()}:${timeRemaining.seconds()}:${timeRemaining.milliseconds()}`;
        this.turnTimerDisplay.next(formattedTime);
      }),
      finalize(() => {
        this.turnStart.next(undefined);
        this.turnTimerDisplay.next('00:00:00');
      })
    );
  }

  /** watchGameProgress 
   * @desc subscribe to all updates to the game
   */
  watchGameProgress(): Observable<any> {
    return this.room.pipe(
      skipWhile((room: LobbyRoom) => !room),
      take(1),
      switchMap((room: LobbyRoom) =>
        concat(this.bhSvc.getGameDetails(room.gameRoomName), this.bhSvc.watchGameDetails()).pipe(
          skipWhile((details: BlackHandDetails) => !details || details.roomName !== room.gameRoomName),
          tap((details: BlackHandDetails) => {
            this.currGameState.next(details);
            const playerData: BlackHandPlayer = AppFns.findPlayerInBlackHandGame(this.currUser.getValue().username);
            this.currPlayerData.next(playerData);
            if (details.phase === 'TRIAL' && this.turnsElapsed === 0) {
              this.bhSvc.evaluateTrial(room.gameRoomName);
            }
          })
        )
      )
    );
  }

  /** isNight
   * @desc checks if the current game phase is night time
   */
  isNight(): boolean {
    const gameState = this.currGameState.getValue();
    return gameState && gameState.phase === 'NIGHT';
  }

  /** getValidAttackList 
   * @desc get a list of players that this player is allowed to attack
   */
  getValidAttackList(player: BlackHandPlayer): string[] {
    const gameState = this.currGameState.getValue();
    let validAttackList: BlackHandPlayer[] = ((gameState && gameState.alivePlayers) || [])
      .filter((validAttackee: BlackHandPlayer) => validAttackee.displayName !== player.displayName);
    if (player.actualFaction === 'Black Hand') {
      validAttackList = validAttackList.filter(
        (validAttackee: BlackHandPlayer) => validAttackee.actualFaction !== 'Black Hand'
      );
    }
    return validAttackList.map((validAttackee: BlackHandPlayer) => validAttackee.displayName);
  }

  /** getValidBlockList 
   * @desc get a list of players that this player is allowed to block
   */
  getValidBlockList(player: BlackHandPlayer): string[] {
    const gameState = this.currGameState.getValue();
    const validBlockList: BlackHandPlayer[] = (gameState && gameState.alivePlayers) || [];
    return validBlockList
      .filter((validBlockee: BlackHandPlayer) => validBlockee.displayName !== player.displayName)
      .map((validBlockee: BlackHandPlayer) => validBlockee.displayName);
  }

  /** attack 
   * @desc submit turn action to attack the selected player
   */
  attack() {
    const currUser: PartyrUser = this.currUser.getValue();
    const room: LobbyRoom = this.room.getValue();
    if (currUser && room && this.actionCtrl.valid) {
      const turnAction: BlackHandPlayerTurn = {
        username: currUser.username,
        roomName: room.gameRoomName,
        attacking: this.actionCtrl.value,
        blocking: null,
        note: null,
        placeOnTrial: null
      };
      this.bhSvc.submitTurn(turnAction);
    }
  }

  /** block
   * @desc submit turn action to block the selected player
   */
  block() {
    const currPlayer: BlackHandPlayer = this.currPlayerData.getValue();
    const room: LobbyRoom = this.room.getValue();
    if (currPlayer && room && this.actionCtrl.valid) {
      const turnAction: BlackHandPlayerTurn = {
        username: currPlayer.username,
        roomName: room.gameRoomName,
        attacking: null,
        blocking: this.actionCtrl.value,
        note: null,
        placeOnTrial: null
      };
      this.bhSvc.submitTurn(turnAction);
    }
  }

  /** hasPlayerActed
   * @desc check if the player has already submitted an action for this turn
   */
  hasPlayerActed(player: BlackHandPlayer): boolean {
    const gameState: BlackHandDetails = this.currGameState.getValue();
    return !gameState.playersTurnRemaining.find((remainingPlayer: string) => player.displayName === remainingPlayer);
  }
}
