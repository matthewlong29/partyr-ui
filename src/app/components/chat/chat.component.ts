import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  HostBinding
} from '@angular/core';
import { Message } from 'src/app/classes/models/shared/Message';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from 'src/app/services/chat.service';
import { tap, first } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { concat, Observable, BehaviorSubject } from 'rxjs';

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

  messages = new BehaviorSubject<Message[]>([]);
  showMessages = new BehaviorSubject<boolean>(false);
  private currUser = new BehaviorSubject<PartyrUser>(undefined);

  /**
   * constructor.
   */
  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

  /**
   * ngOnInit.
   */
  ngOnInit() {
    this.getCurrentUser().subscribe(() => this.showMessages.next(true));
    concat(this.getChatMessages(), this.connectToChat()).subscribe();
  }

  /**
   * getCurrentUser
   */
  getCurrentUser(): Observable<any> {
    return this.userService
      .getCurrentUser()
      .pipe(tap((user: PartyrUser) => this.currUser.next(user)));
  }

  /**
   * getChatMessages
   */
  getChatMessages(): Observable<any> {
    return this.chatService.getAllChat().pipe(
      tap((msgs: Message[]) => this.messages.next(msgs)),
      first()
    );
  }

  /**
   * connectToChat
   */
  connectToChat(): Observable<any> {
    return this.chatService.connectToChat().pipe(
      tap((msg: Message) => {
        const currMsgs: Message[] = this.messages.getValue();
        currMsgs.push(msg);
        this.messages.next(currMsgs);
      })
    );
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
  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const msg: Message = new Message(
        this.newMsgCtrl.value,
        this.currUser.getValue().username,
        new Date().toISOString()
      );
      this.chatService.sendToChat(msg);
      this.newMsgCtrl.reset(null);
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

  /** isMessageFromUser
   * @desc checks if the received message was authored by the current user
   */
  isMessageFromUser(msg: Message) {
    const currUser: PartyrUser = this.currUser.getValue();
    if (currUser) {
      return this.currUser && msg.username === currUser.username;
    }
    return false;
  }
}
