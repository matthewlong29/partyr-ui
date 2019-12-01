import { Injectable } from '@angular/core';
import { from, Observable, scheduled, merge, concat } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { asap } from 'rxjs/internal/scheduler/asap';
import { Signal } from '../classes/models/shared/signal';
import { RTCConnectionMap } from '../classes/models/shared/rtc-connection-map';
import { RTCConnectionRequest } from '../classes/models/shared/rtc-connection-request';
import { RTCConnectionContainer } from '../classes/models/shared/rtc-connection-container';

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  constructor(readonly wsSvc: WebsocketService) {}

  createLocalConnection(
    senderId: string,
    channel: string,
    stream: MediaStream,
    onTrack: (e: RTCTrackEvent) => void
  ): RTCConnectionContainer {
    const connContainer = new RTCConnectionContainer();
    connContainer.connection = new RTCPeerConnection({
      iceServers: [ { urls: 'stun:stun3.l.google.com:19302' } ]
    });
    const conn = connContainer.connection;
    stream.getTracks().forEach((track: MediaStreamTrack) => conn.addTrack(track, stream));
    conn.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      const candidate = e.candidate;
      if (candidate) {
        this.sendSignal(senderId, channel, 'CANDIDATE', JSON.stringify(candidate));
      }
    };
    conn.onnegotiationneeded = async (e: Event) => {
      if (conn.localDescription) {
        this.createOffer(conn).subscribe();
      }
    };

    conn.onsignalingstatechange = (e: Event) => {
      switch (conn.signalingState) {
        case 'have-local-offer':
          this.sendSignal(senderId, channel, 'OFFER', JSON.stringify(conn.localDescription));
          break;
        case 'have-remote-offer':
          this.createAnswer(conn)
            .pipe(tap(() => this.sendSignal(senderId, channel, 'ANSWER', JSON.stringify(conn.localDescription))))
            .subscribe();
      }
    };

    conn.ontrack = onTrack;

    return connContainer;
  }

  sendConnectionRequest(senderId: string, channel: string): void {
    const request = new RTCConnectionRequest(senderId);
    return this.sendSignal(senderId, channel, 'REQUEST', JSON.stringify(request));
  }

  private createOffer(conn: RTCPeerConnection): Observable<void> {
    return from(conn.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })).pipe(
      switchMap((desc: RTCSessionDescriptionInit) => conn.setLocalDescription(desc))
    );
  }

  private createAnswer(conn: RTCPeerConnection): Observable<void> {
    return from(
      conn.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
    ).pipe(
      switchMap((desc: RTCSessionDescriptionInit) => {
        return conn.setLocalDescription(desc);
      })
    );
  }

  listenAndReplyToSignals(currUsername: string, remoteConns: RTCConnectionMap, channel: string): Observable<any> {
    const signalingURL = `${WsBrokerStore.GAME_RTC_BROKER}/${channel}`;
    return this.wsSvc.watch(signalingURL).pipe(
      switchMap((signal: Signal) => {
        if (signal.senderId === currUsername) {
          return scheduled([], asap);
        }
        const remoteConnContainer: RTCConnectionContainer = remoteConns.getConnContainer(signal.senderId);
        const remoteConn = remoteConnContainer.connection;
        const parsedData = JSON.parse(signal.signalData);

        if (remoteConn) {
          switch (signal.signalType) {
            case 'REQUEST':
              if (remoteConn.connectionState === 'new') {
                return this.createOffer(remoteConn);
              }
              break;
            case 'CANDIDATE':
              if (remoteConn.remoteDescription) {
                if (remoteConnContainer.iceCandidates.length) {
                  const addCandidateQueue = remoteConnContainer.iceCandidates.map((cachedCandidate: any) =>
                    this.addICECandidate(remoteConn, cachedCandidate)
                  );
                  remoteConnContainer.iceCandidates = [];
                  return concat(...addCandidateQueue, this.addICECandidate(remoteConn, parsedData));
                }
                return this.addICECandidate(remoteConn, parsedData);
              } else {
                remoteConnContainer.iceCandidates.push(parsedData);
              }
              break;
            case 'OFFER':
              return this.setRemoteDesc(remoteConn, parsedData);
            case 'ANSWER':
              return this.setRemoteDesc(remoteConn, parsedData);
          }
        }

        return scheduled([], asap);
      })
    );
  }

  sendSignal(
    senderId: string,
    channel: string,
    signalType: 'REQUEST' | 'CANDIDATE' | 'OFFER' | 'ANSWER',
    signalData: string
  ): void {
    this.wsSvc.publish(WsBrokerStore.SEND_RTC_SIGNAL, {
      signal: JSON.stringify({ senderId, signalType, signalData }),
      channel
    });
  }

  setRemoteDesc(conn: RTCPeerConnection, desc: RTCSessionDescriptionInit): Observable<RTCPeerConnection> {
    return from(conn.setRemoteDescription(desc)).pipe(
      catchError((err: any) => {
        console.error(err);
        return scheduled([], asap);
      }),
      map(() => conn)
    );
  }

  addICECandidate(conn: RTCPeerConnection, candidate: RTCIceCandidate): Observable<RTCPeerConnection> {
    return from(conn.addIceCandidate(candidate)).pipe(map(() => conn));
  }
}
