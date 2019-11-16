import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, concat } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { LobbyRoom } from 'src/app/classes/models/shared/lobby-room';
import { map } from 'rxjs/operators';
import { AppFns } from 'src/app/classes/utils/app-fns';

@Component({
  selector: 'app-black-hand-game',
  templateUrl: './black-hand-game.component.html',
  styleUrls: ['./black-hand-game.component.scss']
})
export class BlackHandGameComponent implements OnInit, OnDestroy {
  userStream = new BehaviorSubject<MediaStream>(undefined);
  room = new BehaviorSubject<LobbyRoom>(undefined);
  players = new BehaviorSubject<string[]>([]);
  blankArray = new Array(15).fill(0);
  peerConnections: RTCPeerConnection[] = [];
  peerStreams = new BehaviorSubject<MediaStream[]>([]);
  subs: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly lobbySvc: LobbyService
  ) {}

  ngOnInit() {
    this.subs.push(this.watchGameContext());
    this.getUserMedia();
    this.userStream.subscribe((stream: MediaStream) => {
      if (stream) {
        this.startConnections();
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
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
        )
      )
      .subscribe((room: LobbyRoom) => {
        this.room.next(room);

        this.players.next(AppFns.getAllPlayersInRoom(room));
        console.log(room);
      });
  }

  /** startConnections
   * @desc connect to WebRTC peer connections API
   */
  startConnections() {
    const localStream: MediaStream = this.userStream.getValue();
    const audioTracks = localStream.getAudioTracks();
    const videoTracks = localStream.getVideoTracks();
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    if (videoTracks.length > 0) {
      console.log(`Using video device: ${videoTracks[0].label}`);
    }

    const localConnection = new RTCPeerConnection(null);
    const peerConnection = new RTCPeerConnection(null);

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      const peerStreams: MediaStream[] = this.peerStreams.getValue();
      peerStreams.push(event.streams[0]);
    };
    localConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) =>
      this.handleCandidate(
        event.candidate,
        localConnection,
        'local: ',
        'local'
      );
    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) =>
      this.handleCandidate(event.candidate, peerConnection, 'peer', 'remote');

    localStream
      .getTracks()
      .forEach((track: MediaStreamTrack) =>
        localConnection.addTrack(track, localStream)
      );
    localConnection
      .createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      .then((desc: RTCSessionDescriptionInit) => {
        localConnection.setLocalDescription(desc);
        console.log(`Offer from local\n${desc.sdp}`);
        peerConnection.setRemoteDescription(desc);
        peerConnection
          .createAnswer()
          .then((desc: RTCSessionDescriptionInit) => {
            peerConnection.setLocalDescription(desc);
            console.log(`Answer from peer\n${desc.sdp}`);
            localConnection.setRemoteDescription(desc);
          });
      });
  }

  /** handleCandidate
   * @desc handle ICE candidates
   */
  handleCandidate(
    candidate,
    dest: RTCPeerConnection,
    prefix: string,
    type: string
  ) {
    const allPeerConnections = this.peerConnections.find(
      (connection: RTCPeerConnection) => dest
    );
    dest.addIceCandidate(candidate);
    console.log(
      `${prefix}New ${type} ICE candidate: ${
        candidate ? candidate.candidate : '(null)'
      }`
    );
  }

  /** getRTCPeerConnection
   * @desc connect to the WebRTC peer connection API
   */
  getRTCPeerConnection(): void {
    const config: RTCConfiguration = {};
    const pc = new RTCPeerConnection(null);

    const gotOffer = (desc: RTCSessionDescriptionInit) => {
      pc.setLocalDescription(desc);
    };
    // pc.on
    pc.createOffer({});
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
