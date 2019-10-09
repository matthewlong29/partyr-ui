import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../classes/Message';
import { URLStore } from '../classes/url-store';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(readonly http: HttpClient) {}

  /**
   * getAllChat.
   */
  public getAllChat(): Observable<Array<Message>> {
    return this.http.get<Array<Message>>(URLStore.CHAT_MESSAGES);
  }
}
