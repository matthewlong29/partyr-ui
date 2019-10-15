import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import * as SockJS from 'sockjs-client';
import { Message } from 'src/app/classes/Message';
import { PartyrUser } from 'src/app/classes/PartyrUser';
import { URLStore } from 'src/app/classes/url-store';
import { UserService } from 'src/app/services/user.service';
import * as Stomp from 'stompjs';
import { ChatService } from 'src/app/services/chat.service';
import { switchMap, tap, catchError, retryWhen } from 'rxjs/operators';
import { scheduled } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatWindow') private chatWindow: ElementRef;
  @Input() chatPurposeName: string;

  messages: Array<Message> = [];
  message: Message = new Message();
  private stompClient: Stomp;
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
    this.authService.authState
      .pipe(
        switchMap((currentUser: SocialUser) =>
          this.userService.getPartyrUserByEmail(currentUser.email)
        )
      )
      .subscribe((partyrUser: PartyrUser) => {
        this.partyrUser = partyrUser;
        this.initializeNewMessage();
      });

    this.stompClient = this.chatService.openSocket();
    this.chatService
      .connectMsgQueue(this.stompClient, '/chat')
      .pipe(
        retryWhen((err: any) =>
          err.pipe(
            tap(() => (this.stompClient = this.chatService.openSocket()))
          )
        ),
        catchError(() => {
          console.log('catching');
          return scheduled([[]], asap);
        })
      )
      .subscribe((messages: Message[]) => {
        this.messages = messages;
        this.scrollChatToBottom();
      });
  }

  /**
   * getChatMessages
   */
  public getChatMessages(): void {
    this.chatService.getAllChat().subscribe(messages => {
      this.messages = messages;
    });
  }

  /**
   * ngAfterViewChecked.
   */
  ngAfterViewChecked() {
    this.scrollChatToBottom();
  }

  /**
   * initializeMessage.
   */
  private initializeNewMessage() {
    this.message = new Message();
    this.message.author = this.partyrUser.email;
  }

  /**
   * sendMessage.
   */
  sendMessage(event) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.message.content += '\n';
    } else if (event.key === 'Enter') {
      this.chatService.sendMessage(this.stompClient, this.message);
      this.getChatMessages();
      this.initializeNewMessage();
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
