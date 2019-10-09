import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { URLStore } from '../classes/url-store';
import { HttpClient } from '@angular/common/http';

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
