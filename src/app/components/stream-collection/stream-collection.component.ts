import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { combineLatest, BehaviorSubject, Subscription, Observable, from, scheduled } from 'rxjs';
import { skipWhile, take, tap, map, switchMap, catchError } from 'rxjs/operators';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { AppFns } from 'src/app/classes/utils/app-fns';
import { RTCConnectionMap } from 'src/app/classes/models/shared/rtc-connection-map';
import { MediaStreamMap } from 'src/app/classes/models/shared/media-stream-map';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { WebRtcService } from 'src/app/services/web-rtc.service';
import { UserService } from 'src/app/services/user.service';
import { asap } from 'rxjs/internal/scheduler/asap';

@Component({
  selector: 'app-stream-collection',
  templateUrl: './stream-collection.component.html',
  styleUrls: [ './stream-collection.component.scss' ]
})
export class StreamCollectionComponent implements OnInit {
  @Input() currUser: PartyrUser;
  @Input() room: LobbyRoom;
  @Input() hideStreams: string[] = [];

  @Output() allStreamsActive = new EventEmitter<boolean>();

  userStream = new BehaviorSubject<MediaStream>(undefined);
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
    this.subs.push(this.setupConnectionSlots().subscribe());
  }

  setupConnectionSlots() {
    return this.getUserMedia().pipe(
      skipWhile((stream: MediaStream) => !stream || !stream.getTracks().length),
      take(1),
      tap((stream: MediaStream) => {
        const allPlayers: string[] = AppFns.getAllPlayersInRoom(this.room).filter(
          (peerUsername: string) => peerUsername !== this.currUser.username
        );
        this.players.next(allPlayers);
        allPlayers.forEach((peerUsername: string) =>
          this.connections.addConnContainer(
            peerUsername,
            this.rtcSvc.createLocalConnection(
              this.currUser.username,
              this.room.gameRoomName,
              stream,
              this.addStream(peerUsername).bind(this)
            )
          )
        );
        this.checkAllStreamsActive();
        this.rtcSvc.sendConnectionRequest(this.currUser.username, this.room.gameRoomName);
      }),
      switchMap(() =>
        this.rtcSvc.listenAndReplyToSignals(this.currUser.username, this.connections, this.room.gameRoomName)
      )
    );
  }

  /** addStream
   * @desc add a received stream when connection receives an RTCTrackEvent
   */
  addStream(remoteId: string) {
    return (e: RTCTrackEvent) => {
      this.streams.addStream(remoteId, e.streams[0]);
      this.checkAllStreamsActive();
    };
  }

  /** checkAllStreamsActive 
   * @desc check if there is an active stream for all players and emit event if true
   */
  checkAllStreamsActive(): void {
    const allPlayers: string[] = this.players.getValue();
    const streamIds: string[] = this.streams.getRemotePeerIds();
    if (allPlayers.length === streamIds.length) {
      this.allStreamsActive.emit(true);
    }
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
    const playerCount: number = (players || { length: 1 }).length;
    const width = Math.max(18, 90 / playerCount);
    return `${width}vw`;
  }

  /** isStreamHidden
   * @desc check if the given stream is included in the hidden streams array
   */
  isStreamHidden(remotePeerId: string): boolean {
    return (this.hideStreams || []).includes(remotePeerId);
  }
}
