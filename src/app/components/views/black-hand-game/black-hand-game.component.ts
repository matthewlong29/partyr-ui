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
  remoteStreams = new BehaviorSubject<RemoteStream[]>([]);
  // streams = new MediaStreamMap();
  // localConn: RTCPeerConnection;
  // remoteConns: PeerConnectionContainer[];

  subs: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly lobbySvc: LobbyService,
    readonly rtcSvc: WebRtcService,
    readonly userSvc: UserService
  ) {}

  ngOnInit() {
    this.subs.push(
      this.setupConnectionSlots().subscribe(),
      this.watchGameContext(),
      this.remoteStreams.subscribe((stream) => {
        console.log(stream);
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  setupConnectionSlots() {
    return combineLatest([ this.room, this.getUserMedia(), this.userSvc.getCurrentUser() ]).pipe(
      skipWhile(
        ([ room, stream, user ]: [LobbyRoom, MediaStream, PartyrUser]) =>
          !room || !stream || !stream.getTracks().length || !user
      ),
      take(1),
      tap(([ room, stream, user ]: [LobbyRoom, MediaStream, PartyrUser]) => {
        this.currUser.next(user);
        AppFns.getAllPlayersInRoom(room)
          .filter((peerUsername: string) => peerUsername !== user.username)
          .forEach((peerUsername: string) =>
            this.connections.addConnection(
              peerUsername,
              this.rtcSvc.createLocalConnection(
                user.username,
                room.gameRoomName,
                stream,
                this.addStream(peerUsername).bind(this)
              )
            )
          );
      }),
      map(([ room, _, user ]) => [ room, user ]),
      tap(([ room, user ]: [LobbyRoom, PartyrUser]) =>
        this.rtcSvc.sendConnectionRequest(user.username, room.gameRoomName)
      ),
      switchMap(([ room, user ]: [LobbyRoom, PartyrUser]) =>
        this.rtcSvc.listenAndReplyToSignals(user.username, this.connections, room.gameRoomName)
      )
    );
  }

  /** addStream
   * @desc add a received stream when connection receives an RTCTrackEvent
   */
  addStream(remoteId: string) {
    return (e: RTCTrackEvent) => {
      const stream: RemoteStream = { remotePeerId: remoteId, stream: e.streams[0] };
      const currStreams = this.remoteStreams.getValue();
      currStreams.push(stream);
      this.remoteStreams.next(currStreams);
    };
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

  /** getUserMedia
   * @desc get the user's webcam and microphone
   */
  getUserMedia(): Observable<MediaStream> {
    const constraints: MediaStreamConstraints = { video: true, audio: true };
    return from(navigator.mediaDevices.getUserMedia(constraints)).pipe(
      catchError((err: any) => {
        console.error(err);
        return scheduled([], asap);
      }),
      tap((stream: MediaStream) => this.userStream.next(stream))
    );
  }

  /** calcMediaHeightWidth
   * @desc distribute the media width based on the number of players in the game
   */
  calcMediaHeightWidth(players?: string[]): string {
    const playerCount: number = (players || { length: 0 }).length;
    return `calc(90vw / ${Math.round(playerCount / 2)})`;
    // return `calc(90vw / ${15})`;
  }
}
