import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, concat, combineLatest, Observable, scheduled, merge, from } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { map, tap, switchMap, take, skipWhile, catchError } from 'rxjs/operators';
import { AppFns } from 'src/app/classes/utils/app-fns';
import { WebRtcService } from 'src/app/services/web-rtc.service';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { RTCConnectionMap } from 'src/app/classes/models/shared/rtc-connection-map';
import { asap } from 'rxjs/internal/scheduler/asap';
import { MediaStreamMap } from 'src/app/classes/models/shared/media-stream-map';
import { RemoteStream } from 'src/app/classes/models/shared/remote-stream';

@Component({
  selector: 'app-black-hand-game',
  templateUrl: './black-hand-game.component.html',
  styleUrls: [ './black-hand-game.component.scss' ]
})
export class BlackHandGameComponent implements OnInit, OnDestroy {
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  userStream = new BehaviorSubject<MediaStream>(undefined);
  room = new BehaviorSubject<LobbyRoom>(undefined);
  players = new BehaviorSubject<string[]>([]);

  connections = new RTCConnectionMap();
  streams = new MediaStreamMap();

  subs: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly lobbySvc: LobbyService,
    readonly rtcSvc: WebRtcService,
    readonly userSvc: UserService
  ) {}

  ngOnInit() {
    this.subs.push(this.watchGameContext(), this.getCurrUser().subscribe());
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
  watchGameContext(): Subscription {
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
}
