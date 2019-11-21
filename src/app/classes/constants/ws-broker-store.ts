export class WsBrokerStore {
  /***** Brokers *****/
  static GAME_RTC_BROKER = '/game';

  /***** Queues *****/
  static LOBBY_CHAT_QUEUE = '/chat/room';
  static LOBBY_ROOMS_QUEUE = '/lobby/rooms';

  /***** MessageMaps *****/
  static SEND_LOBBY_CHAT_MSG = '/app/send-chat';
  static CREATE_LOBBY_ROOM = '/app/create-room';
  static JOIN_LOBBY_ROOM = '/app/join-room';
  static LEAVE_LOBBY_ROOM = '/app/leave-room';
  static DELETE_LOBBY_ROOM = '/app/delete-room';
  static TOGGLE_READY_STATUS = '/app/toggle-ready-status';
  static SEND_RTC_SIGNAL = '/app/signal-rtc';
}
