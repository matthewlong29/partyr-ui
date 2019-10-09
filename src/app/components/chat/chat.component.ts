import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { AuthService } from 'angularx-social-login';
import * as SockJS from 'sockjs-client';
import { Message } from 'src/app/classes/Message';
import { PartyrUser } from 'src/app/classes/PartyrUser';
import { URLStore } from 'src/app/classes/url-store';
import { UserService } from 'src/app/services/user.service';
import * as Stomp from 'stompjs';
import { ChatService } from 'src/app/services/chat.service';

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
    // TODO flatten nested subscribes and move logic to user service.
    this.authService.authState.subscribe(currentUser => {
      this.userService
        .getPartyrUserByEmail(currentUser.email)
        .subscribe(partyrUser => {
          this.partyrUser = partyrUser;
          this.initializeNewMessage();
        });
    });

    this.getOldChatMessages();

    const ws = new SockJS(URLStore.WEBSOCKET_URL);

    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe('/chat', message => {
        if (message.body) {
          console.log(message.body);
        }
      });
    });

    this.scrollChatToBottom();
  }

  /**
   * getOldChatMessages
   */
  public getOldChatMessages(): void {
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
      this.stompClient.send(
        '/app/send/message',
        {},
        JSON.stringify(this.message)
      );
      this.getOldChatMessages();
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
