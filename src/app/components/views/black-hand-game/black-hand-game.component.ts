import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Subscription,
  concat,
  combineLatest,
  Observable,
  scheduled,
  merge
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { map, tap, switchMap, take, skipWhile } from 'rxjs/operators';
import { AppFns } from 'src/app/classes/utils/app-fns';
import { WebRtcService } from 'src/app/services/web-rtc.service';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { RTCConnectionMap } from 'src/app/classes/models/shared/rtc-connection-map';
import { asap } from 'rxjs/internal/scheduler/asap';
import { MediaStreamMap } from 'src/app/classes/models/shared/media-stream-map';

@Component({
  selector: 'app-black-hand-game',
  templateUrl: './black-hand-game.component.html',
  styleUrls: ['./black-hand-game.component.scss']
})
export class BlackHandGameComponent implements OnInit, OnDestroy {
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  userStream = new BehaviorSubject<MediaStream>(undefined);
  room = new BehaviorSubject<LobbyRoom>(undefined);
  players = new BehaviorSubject<string[]>([]);

  connections = new RTCConnectionMap();
  streams = new MediaStreamMap();
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
    this.subs.push(this.watchForOffers(), this.watchGameContext());
    this.getUserMedia();
    this.userStream.subscribe((stream: MediaStream) => {
      if (stream) {
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  // /** signalInitialOffer
  //  * @desc send the initial offer to the signaling websocket once room details are gathered
  //  */
  // signalInitialOffer(senderId: string): Observable<any> {
  //   return this.room.pipe(
  //     skipWhile((room?: LobbyRoom) => !room),
  //     take(1),
  //     switchMap((room: LobbyRoom) =>
  //       this.rtcSvc.createAndSendOffer(
  //         senderId,
  //         this.peerConnectionObj,
  //         room.gameRoomName
  //       )
  //     )
  //   );
  // }

  /** watchForOffers
   * @desc watch for Web RTC offers
   */
  watchForOffers(): Subscription {
    return combineLatest([
      this.room,
      this.userStream,
      this.userSvc.getCurrentUser()
    ])
      .pipe(
        skipWhile(
          ([room, stream, user]: [LobbyRoom?, MediaStream?, PartyrUser?]) =>
            !room || !stream || !user
        ),
        take(1),
        tap(([room, stream, user]: [LobbyRoom, MediaStream, PartyrUser]) => {
          this.currUser.next(user);
          AppFns.getAllPlayersInRoom(room)
            .filter((username: string) => username !== user.username)
            .forEach((username: string) =>
              this.connections.addConnection(
                username,
                this.rtcSvc.createLocalConnection(
                  user.username,
                  room.gameRoomName,
                  stream.getTracks(),
                  this.addStream(username).bind(this)
                )
              )
            );
        }),
        map(([room, _, user]: [LobbyRoom, MediaStream, PartyrUser]) => [
          room,
          user
        ]),
        switchMap(([room, user]: [LobbyRoom, PartyrUser]) => {
          const potentialOffers: Observable<any>[] = Object.keys(
            this.connections.getConnections()
          ).map((remotePeerId: string) => {
            const conn: RTCPeerConnection = this.connections.getConnection(
              remotePeerId
            );
            return !conn.currentRemoteDescription
              ? this.rtcSvc.createAndSendOffer(
                  user.username,
                  conn,
                  room.gameRoomName
                )
              : scheduled([], asap);
          });
          return merge(...potentialOffers).pipe(
            take(1),
            map(() => room),
            switchMap(() =>
              this.rtcSvc.listenAndReplyToSignals(
                user.username,
                this.connections,
                room.gameRoomName
              )
            )
          );
        })
      )
      .subscribe();
  }

  /** addStream
   * @desc add a received stream when connection receives an RTCTrackEvent
   */
  addStream(remoteId: string) {
    return (e: RTCTrackEvent) => {
      this.streams.addStream(remoteId, e.streams[0]);
    };
  }

  /** watchGameContext
   * @desc subscribe to any updates to the game
   */
  watchGameContext(): Subscription {
    return concat(
      this.lobbySvc.getAvailableRooms(),
      this.lobbySvc.watchAvailableRooms()
    )
      .pipe(
        map((rooms: LobbyRoom[]) =>
          rooms.find(
            (room: LobbyRoom) =>
              room.gameRoomName === this.route.snapshot.paramMap.get('roomName')
          )
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
  getUserMedia(): void {
    const constraints: MediaStreamConstraints = { video: true, audio: true };

    const handleSuccess: NavigatorUserMediaSuccessCallback = (
      stream: MediaStream
    ) => {
      this.userStream.next(stream);
    };

    const handleError: NavigatorUserMediaErrorCallback = (
      err: MediaStreamError
    ) => {
      console.error(err);
    };

    navigator.getUserMedia(constraints, handleSuccess, handleError);
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
