import { Injectable } from '@angular/core';
import { from, Observable, scheduled, merge } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { asap } from 'rxjs/internal/scheduler/asap';
import { Signal } from '../classes/models/shared/signal';
import { RTCConnectionMap } from '../classes/models/shared/rtc-connection-map';
import { RTCConnectionRequest } from '../classes/models/shared/rtc-connection-request';

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  constructor(readonly wsSvc: WebsocketService) {}

  createLocalConnection(senderId: string, channel: string, stream: MediaStream, onTrack: (e: RTCTrackEvent) => void) {
    const conn = new RTCPeerConnection();
    console.log('Sending the following tracks', stream.getTracks());
    stream.getTracks().forEach((track: MediaStreamTrack) => conn.addTrack(track, stream));
    conn.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      const candidate = e.candidate;
      console.log('New local candidate', candidate);
      this.sendSignal(senderId, channel, 'CANDIDATE', JSON.stringify(candidate));
    };
    conn.onnegotiationneeded = async (e: Event) => {
      console.log('negotiation needed');
      if (conn.localDescription) {
        this.createAndSendOffer(senderId, conn, channel).subscribe();
      }
    };

    conn.onconnectionstatechange = (e: Event) => {
      console.log('Connection state', conn.connectionState);
    };

    conn.onsignalingstatechange = (e: Event) => {
      console.log('Signaling state', conn.signalingState);
    };

    conn.ontrack = onTrack;

    return conn;
  }

  sendConnectionRequest(senderId: string, channel: string): void {
    console.log(`Sending connection request to ${channel}`);
    const request = new RTCConnectionRequest(senderId);
    return this.sendSignal(senderId, channel, 'REQUEST', JSON.stringify(request));
  }

  createAndSendOffer(senderId: string, conn: RTCPeerConnection, channel: string): Observable<RTCPeerConnection> {
    return this.createOffer(conn).pipe(
      switchMap((desc: RTCSessionDescriptionInit) =>
        this.setLocalDesc(conn, desc).pipe(
          tap((localConn: RTCPeerConnection) => {
            const localDesc = JSON.stringify(localConn.localDescription.toJSON());
            console.log('Offer', localDesc);
            this.sendSignal(senderId, channel, 'OFFER', localDesc);
          })
        )
      )
    );
  }

  createAndSendAnswer(senderId: string, conn: RTCPeerConnection, channel: string): Observable<RTCPeerConnection> {
    return this.createAnswer(conn).pipe(
      switchMap((desc: RTCSessionDescription) => {
        return this.setLocalDesc(conn, desc).pipe(
          tap((localConn: RTCPeerConnection) => {
            const localDesc = JSON.stringify(localConn.localDescription.toJSON());
            console.log('Answer', localDesc);
            this.sendSignal(senderId, channel, 'ANSWER', localDesc);
          })
        );
      }),
      map(() => conn)
    );
  }

  private setLocalDesc(conn: RTCPeerConnection, desc: RTCSessionDescriptionInit): Observable<RTCPeerConnection> {
    return from(conn.setLocalDescription(desc)).pipe(map(() => conn));
  }

  private createOffer(conn: RTCPeerConnection): Observable<RTCSessionDescriptionInit> {
    return from(conn.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true }));
  }

  private createAnswer(conn: RTCPeerConnection) {
    return from(
      conn.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
    ).pipe(tap((answer: RTCSessionDescriptionInit) => console.log('Creating answer', answer)));
  }

  listenAndReplyToSignals(currUsername: string, remoteConns: RTCConnectionMap, channel: string): Observable<any> {
    const signalingURL = `${WsBrokerStore.GAME_RTC_BROKER}/${channel}`;
    console.log(`Listening for signals at ${signalingURL}`);
    return this.wsSvc.watch(signalingURL).pipe(
      switchMap((signal: Signal) => {
        if (signal.senderId === currUsername) {
          return scheduled([], asap);
        }
        console.log('Signal received');
        const remoteConn: RTCPeerConnection = remoteConns.getConnection(signal.senderId);
        const parsedData = JSON.parse(signal.signalData);
        console.log('Signal type', signal.signalType);
        console.log('Remote conn', remoteConn);
        console.log('Data', parsedData);

        if (remoteConn && parsedData) {
          switch (signal.signalType) {
            case 'REQUEST':
              if (remoteConn.connectionState === 'new') {
                return this.createAndSendOffer(currUsername, remoteConn, channel);
              }
              break;
            case 'CANDIDATE':
              if (remoteConn.remoteDescription) {
                return this.addICECandidate(remoteConn, parsedData);
              }

              break;
            case 'OFFER':
              console.log('OFFER received', parsedData);
              return this.setRemoteDesc(remoteConn, parsedData).pipe(
                switchMap(() => this.createAndSendAnswer(currUsername, remoteConn, channel))
              );
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
    console.log(`Sending signal to ${WsBrokerStore.SEND_RTC_SIGNAL}`);
    this.wsSvc.publish(WsBrokerStore.SEND_RTC_SIGNAL, {
      signal: JSON.stringify({ senderId, signalType, signalData }),
      channel
    });
  }

  setRemoteDesc(conn: RTCPeerConnection, desc: RTCSessionDescriptionInit): Observable<RTCPeerConnection> {
    console.log('Attempting to set remote description');

    return from(conn.setRemoteDescription(desc)).pipe(
      catchError((err: any) => {
        console.error(err);
        return scheduled([], asap);
      }),
      map(() => conn),
      tap(() => console.log('Setting remote description'))
    );
  }

  addICECandidate(conn: RTCPeerConnection, candidate: RTCIceCandidate): Observable<RTCPeerConnection> {
    console.log('Adding candidate', candidate);
    return from(conn.addIceCandidate(candidate)).pipe(map(() => conn));
  }
}
