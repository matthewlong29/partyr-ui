import { Injectable } from '@angular/core';
import { from, Observable, scheduled } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { asap } from 'rxjs/internal/scheduler/asap';
import { Signal } from '../classes/models/shared/signal';
import { RTCConnectionMap } from '../classes/models/shared/rtc-connection-map';

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  constructor(readonly wsSvc: WebsocketService) {}

  createLocalConnection(
    senderId: string,
    channel: string,
    mediaTracks: MediaStreamTrack[],
    onTrack: (e: RTCTrackEvent) => void
  ) {
    const conn = new RTCPeerConnection();
    mediaTracks.forEach((track: MediaStreamTrack) => conn.addTrack(track));
    conn.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      const candidate = e.candidate;
      this.sendSignal(senderId, channel, JSON.stringify(candidate));
    };
    conn.onnegotiationneeded = async (e: Event) => {
      console.log('negotiation needed');
      this.createAndSendOffer(senderId, conn, channel).subscribe();
    };
    conn.ontrack = onTrack;

    return conn;
  }

  createAndSendOffer(
    senderId: string,
    conn: RTCPeerConnection,
    channel: string
  ): Observable<RTCPeerConnection> {
    return this.createOffer(conn).pipe(
      switchMap((desc: RTCSessionDescriptionInit) =>
        this.setLocalDesc(conn, desc).pipe(
          tap((localConn: RTCPeerConnection) => {
            this.sendSignal(
              senderId,
              channel,
              JSON.stringify(localConn.localDescription.toJSON)
            );
          })
        )
      )
    );
  }

  createAndSendAnswer(
    senderId: string,
    conn: RTCPeerConnection,
    channel: string
  ): Observable<RTCPeerConnection> {
    return this.createAnswer(conn).pipe(
      switchMap((desc: RTCSessionDescription) =>
        this.setLocalDesc(conn, desc).pipe(
          tap((localConn: RTCPeerConnection) =>
            this.sendSignal(
              senderId,
              channel,
              JSON.stringify(localConn.localDescription.toJSON)
            )
          )
        )
      ),
      map(() => conn)
    );
  }

  private setLocalDesc(
    conn: RTCPeerConnection,
    desc: RTCSessionDescriptionInit
  ): Observable<RTCPeerConnection> {
    return from(conn.setLocalDescription(desc)).pipe(map(() => conn));
  }

  private createOffer(
    conn: RTCPeerConnection
  ): Observable<RTCSessionDescriptionInit> {
    return from(
      conn.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
    );
  }

  private createAnswer(conn: RTCPeerConnection) {
    return from(
      conn.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
    );
  }

  listenAndReplyToSignals(
    currUsername: string,
    remoteConns: RTCConnectionMap,
    channel: string
  ): Observable<any> {
    const signalingURL = `${WsBrokerStore.GAME_RTC_BROKER}/${channel}`;
    console.log(`Listening for signals at ${signalingURL}`);
    return this.wsSvc.watch(signalingURL).pipe(
      tap((signal: Signal) => console.log('incoming offer', signal)),
      switchMap((signal: Signal) => {
        if (signal.senderId === currUsername) {
          return scheduled([], asap);
        }
        const remoteConn: RTCPeerConnection = remoteConns.getConnection(
          signal.senderId
        );
        if (signal.signalData instanceof RTCIceCandidate) {
          if (remoteConn) {
            return this.addICECandidate(remoteConn, signal.signalData);
          }
        }
        if (signal.signalData instanceof RTCSessionDescription) {
          if (remoteConn) {
            switch (signal.signalData.type) {
              case 'offer':
                return this.setRemoteDesc(remoteConn, signal.signalData).pipe(
                  switchMap(() =>
                    this.createAndSendAnswer(currUsername, remoteConn, channel)
                  )
                );
              case 'answer':
                return this.setRemoteDesc(remoteConn, signal.signalData);
            }
          }
        }
        return scheduled([], asap);
      })
    );
  }

  sendSignal(senderId: string, channel: string, signalData: string): void {
    console.log(`Sending signal to ${WsBrokerStore.SEND_RTC_SIGNAL}`);
    this.wsSvc.publish(WsBrokerStore.SEND_RTC_SIGNAL, {
      signal: { senderId, signalData },
      channel
    });
  }

  setRemoteDesc(
    conn: RTCPeerConnection,
    desc: RTCSessionDescription
  ): Observable<RTCPeerConnection> {
    return from(conn.setRemoteDescription(desc)).pipe(map(() => conn));
  }

  addICECandidate(
    conn: RTCPeerConnection,
    candidate: RTCIceCandidate
  ): Observable<RTCPeerConnection> {
    return from(conn.addIceCandidate(candidate)).pipe(map(() => conn));
  }
}
