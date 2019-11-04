import { Injectable } from '@angular/core';
import { Subject, Observer, Observable, scheduled, Subscription } from 'rxjs';
import { URLStore } from '../classes/constants/url-store';
import * as SockJS from 'sockjs-client';
import { Stomp, IMessage } from '@stomp/stompjs';
import { RxStomp } from '@stomp/rx-stomp';
import { asap } from 'rxjs/internal/scheduler/asap';
import { map } from 'rxjs/operators';
import { Message } from '../classes/models/Message';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private rxStomp?: RxStomp;
  connectedSub = new Subscription();

  constructor() {}

  private connect(): void {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      webSocketFactory: () => new SockJS(URLStore.WEBSOCKET_URL),
      reconnectDelay: 200
    });
    this.rxStomp.activate();
    this.connectedSub = this.rxStomp.connected$.subscribe(() => {
      console.log('Successfully connected to WebSocket');
    });
  }

  public watch<T>(url: string): Observable<T> {
    if (!this.rxStomp) {
      this.connect();
    }
    return this.rxStomp
      .watch(url)
      .pipe(map((msg: IMessage) => JSON.parse(msg.body)));
  }

  public publish(url: string, body?: any): void {
    if (!this.rxStomp) {
      this.connect();
    }
    this.rxStomp.publish({ destination: url, body: JSON.stringify(body) });
  }
}
