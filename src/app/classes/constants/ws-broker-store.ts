export class WsBrokerStore {
  /***** Brokers *****/
  static GAME_RTC_BROKER = '/game';
  static BH_GAME_DETAILS_BROKER = '/game/black-hand';

  /***** Queues *****/
  static LOBBY_CHAT_QUEUE = '/chat/room/room';
  static LOBBY_ROOMS_QUEUE = '/lobby/rooms/room';

  /***** MessageMaps *****/
  static SEND_LOBBY_CHAT_MSG = '/app/send-chat/room';
  static CREATE_LOBBY_ROOM = '/app/create-room/room';
  static JOIN_LOBBY_ROOM = '/app/join-room/room';
  static LEAVE_LOBBY_ROOM = '/app/leave-room/room';
  static DELETE_LOBBY_ROOM = '/app/delete-room/room';
  static TOGGLE_READY_STATUS = '/app/toggle-ready-status/room';
  static SEND_RTC_SIGNAL = '/app/signal-rtc';

  /***** BlackHandMessageMaps *****/
  static BLACK_HAND_START_SEND = '/app/start-black-hand/room';
  static BLACK_HAND_SELECT_PREFERRED_FACTION = '/app/select-preferred-faction/room';
  static BLACK_HAND_SELECT_DISPLAY_NAME = '/app/select-display-name/room';
  static BLACK_HAND_SUBMIT_TURN = '/app/submit-turn/room';
  static BLACK_HAND_EVALUATE_DAY = '/app/evaluate-day/room';
  static BLACK_HAND_SUBMIT_VOTE = '/app/submit-vote/room';
  static BLACK_HAND_EVALUATE_TRIAL = '/app/evaluate-trial/room';
  static BLACK_HAND_EVALUATE_NIGHT = '/app/evaluate-night/room';
}
