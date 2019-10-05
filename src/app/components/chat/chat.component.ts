import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Input
} from "@angular/core";
import * as SockJS from "sockjs-client";
import { URLStore } from "src/app/classes/url-store";
import * as Stomp from "stompjs";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild("chatWindow") private chatWindow: ElementRef;

  messages: Array<String> = [];
  message: String;
  @Input() chatPurposeName: String;

  private stompClient: Stomp;

  constructor() {}

  ngOnInit() {
    let ws = new SockJS(URLStore.WEBSOCKET_URL);

    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe("/chat", message => {
        if (message.body) {
          this.messages.push(message.body);
        }
      });
    });

    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  /**
   * sendMessage.
   */
  sendMessage(event) {
    if (event.ctrlKey && event.key === "Enter") {
      this.message += "\n";
    } else if (event.key === "Enter") {
      this.stompClient.send("/app/send/message", {}, this.message);
      this.message = null; // clear message in textarea after send
    }
  }

  /**
   * scrollToBottom: keeps chat scrolled to bottom.
   */
  scrollToBottom() {
    try {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    } catch (error) {
      console.error(error);
    }
  }
}
