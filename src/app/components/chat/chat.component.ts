import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  HostBinding
} from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { Message } from 'src/app/classes/Message';
import { PartyrUser } from 'src/app/classes/PartyrUser';
import { UserService } from 'src/app/services/user.service';
import * as Stomp from 'stompjs';
import { ChatService } from 'src/app/services/chat.service';
import { switchMap, finalize, tap, first } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { concat, Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @HostBinding('style.height') hostHeight = '100%';
  @HostBinding('style.display') hostDisplay = 'flex';

  @ViewChild('chatWindow') private chatWindow: ElementRef;
  @Input() chatPurposeName: string;

  newMsgCtrl = new FormControl('');

  messages: Array<Message> = [];
  message: Message = new Message();
  private partyrUser: PartyrUser = new PartyrUser();

  /**
   * constructor.
   */
  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  /**
   * ngOnInit.
   */
  ngOnInit() {
    concat(
      this.getCurrentUser(),
      this.getChatMessages(),
      this.connectToChat()
    ).subscribe();
  }

  /**
   * getCurrentUser
   */
  getCurrentUser(): Observable<any> {
    return this.authService.authState.pipe(
      switchMap((currentUser: SocialUser) =>
        this.userService.getPartyrUserByEmail(currentUser.email)
      ),
      tap((user: PartyrUser) => (this.partyrUser = user)),
      first()
    );
  }

  /**
   * getChatMessages
   */
  getChatMessages(): Observable<any> {
    return this.chatService.getAllChat().pipe(
      tap((msgs: Message[]) => (this.messages = msgs)),
      first()
    );
  }

  /**
   * connectToChat
   */
  connectToChat(): Observable<any> {
    return this.chatService
      .connectToChat()
      .pipe(tap((msg: Message) => this.messages.push(msg)));
  }

  /**
   * ngAfterViewChecked.
   */
  ngAfterViewChecked() {
    this.scrollChatToBottom();
  }

  /**
   * getTypedMessage.
   */
  private getTypedMessage(): Message {
    return {
      author: this.partyrUser.email,
      content: this.newMsgCtrl.value,
      timeOfMessage: new Date().toISOString()
    };
  }

  /**
   * sendMessage.
   */
  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const msg: Message = this.getTypedMessage();
      this.chatService.sendToChat(msg);
      this.newMsgCtrl.reset('');
    }
  }

  /**
   * scrollChatToBottom: keeps chat scrolled to bottom.
   */
  scrollChatToBottom() {
    try {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    } catch (error) {
      console.error(error);
    }
  }
}
