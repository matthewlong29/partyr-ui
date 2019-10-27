export class WsBrokerStore {
  /***** Queues *****/
  static LOBBY_CHAT_QUEUE = '/chat/lobby';
  static LOBBY_ROOMS_QUEUE = '/public/rooms';

  /***** MessageMaps *****/
  static LOBBY_CHAT_SEND_MSG = '/app/send/lobby-chat';
  static LOBBY_ROOMS_CREATE = '/app/create/lobby-room';
}
