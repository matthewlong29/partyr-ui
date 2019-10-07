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
import { PartyrUser } from 'src/app/classes/PartyrUser';
import { URLStore } from 'src/app/classes/url-store';
import { UserService } from 'src/app/services/user.service';
import * as Stomp from 'stompjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatWindow') private chatWindow: ElementRef;
  @Input() chatPurposeName: string;

  messages: Array<string> = [];
  message: string;
  private stompClient: Stomp;
  private partyrUser: PartyrUser;

  /**
   * constructor.
   */
  constructor(
    private userService: UserService,
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
        .subscribe(partyrUser => (this.partyrUser = partyrUser));
    });

    const ws = new SockJS(URLStore.WEBSOCKET_URL);

    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe('/chat', message => {
        if (message.body) {
          this.messages.push(message.body);
        }
      });
    });

    this.scrollChatToBottom();
  }

  /**
   * ngAfterViewChecked.
   */
  ngAfterViewChecked() {
    this.scrollChatToBottom();
  }

  /**
   * sendMessage.
   */
  sendMessage(event) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.message += '\n';
    } else if (event.key === 'Enter') {
      this.stompClient.send('/app/send/message', {}, this.message);
      this.message = null; // clear message in textarea after send
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
