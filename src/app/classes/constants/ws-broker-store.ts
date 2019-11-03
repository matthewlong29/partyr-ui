export class WsBrokerStore {
  /***** Queues *****/
  static LOBBY_CHAT_QUEUE = '/chat/room';
  static LOBBY_ROOMS_QUEUE = '/lobby/rooms';

  /***** MessageMaps *****/
  static LOBBY_CHAT_SEND_MSG = '/app/send-chat';
  static LOBBY_ROOMS_CREATE = '/app/create-room';
}
