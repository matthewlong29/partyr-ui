import { InjectableRxStompConfig } from "@stomp/ng2-stompjs";
import { URLStore } from './classes/constants/url-store';


export const myRxStompConfig: InjectableRxStompConfig = {
  // Which server?
  // brokerURL: "ws://127.0.0.1:15674/ws",
  brokerURL: URLStore.WEBSOCKET_URL,

  // Typical keys: login, passcode, host
  connectHeaders: {
    login: "guest",
    passcode: "guest"
  },

  heartbeatIncoming: 0, // 0 means disabled
  heartbeatOutgoing: 20000, // every 20 seconds
  reconnectDelay: 500, // every 0.5 seconds

  debug: (msg: string): void => {
    console.log(new Date(), msg);
  }
};
