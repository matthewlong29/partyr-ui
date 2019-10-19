export class URLStore {
  //***** CLIENT ROUTES *****/
  static LOGIN_URL = '/login';
  static HOME_URL = '/home';
  static GAME_SELECT_URL = '/game-select';
  static LOBBY_URL = '/lobby';

  /***** NODE ENDPOINTS *****/
  // static LOGGED_IN_URL = '/logged-in';
  static CURRENT_USER = 'api/current-user/';
  static CHAT_MESSAGES = 'api/chat';
  static AUTH_ID_TOKEN_URL = '/auth-id-token';

  /***** AUTHENTICATION *****/
  static GOOGLE_SIGN_IN_URL = '/api/google-authenticate';
  static CHECK_AUTH_URL = 'api/check-auth';

  /***** WEBSOCKET *****/
  static WEBSOCKET_URL = '/ws/socket';
  static WS_WATCH_LOBBY_CHAT = '/chat/lobby';
  static WS_SEND_LOBBY_CHAT = '/app/lobby-chat';
}
