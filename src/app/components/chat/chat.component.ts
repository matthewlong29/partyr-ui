import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  HostBinding
} from '@angular/core';
import { Message } from 'src/app/classes/models/Message';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from 'src/app/services/chat.service';
import { tap, first } from 'rxjs/operators';
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
  private currUser: PartyrUser = new PartyrUser();

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
    this.getCurrentUser().subscribe();
    concat(this.getChatMessages(), this.connectToChat()).subscribe();
  }

  /**
   * getCurrentUser
   */
  getCurrentUser(): Observable<any> {
    return this.userService
      .getCurrentUser()
      .pipe(tap((user: PartyrUser) => (this.currUser = user)));
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
   * sendMessage.
   */
  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const msg: Message = new Message(
        this.newMsgCtrl.value,
        this.currUser.email,
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
    return this.currUser && msg.email === this.currUser.email;
  }
}
