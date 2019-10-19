import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, scheduled, Subject } from 'rxjs';
import { Message } from '../classes/Message';
import { URLStore } from '../classes/url-store';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { tap, catchError, map } from 'rxjs/operators';
import { asap } from 'rxjs/internal/scheduler/asap';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/ws-broker-store';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(readonly http: HttpClient, readonly wsSvc: WebsocketService) {}

  connectToChat(): Observable<Message> {
    return this.wsSvc.watch(WsBrokerStore.LOBBY_CHAT_QUEUE);
  }

  sendToChat(message: Message): void {
    this.wsSvc.publish(WsBrokerStore.LOBBY_CHAT_MSG, message);
  }

  /**
   * getAllChat.
   */
  public getAllChat(): Observable<Array<Message>> {
    return this.http.get<Array<Message>>(URLStore.CHAT_MESSAGES);
  }

  public openSocket(): Stomp {
    const ws = new SockJS(URLStore.WEBSOCKET_URL);
    return Stomp.over(ws);
  }

  public closeSocket(client: Stomp): void {
    client.disconnect();
  }

  public connectMsgQueue(
    client: Stomp,
    queueName: string
  ): Observable<Message[]> {
    return new Observable(observer => {
      this.getAllChat()
        .pipe(
          tap((messages: Message[]) => {
            observer.next(messages);
            client.subscribe(queueName, message => {
              if (message.body) {
                this.getAllChat().subscribe((liveMessages: Message[]) =>
                  observer.next(liveMessages)
                );
              }
            });
          }),
          catchError((err: any) => {
            observer.error(err);
            return scheduled([[]], asap);
          })
        )
        .subscribe();
    });
  }

  public sendMessage(client: Stomp, message: Message | string) {
    client.send('/app/send/message', {}, JSON.stringify(message));
  }
}
