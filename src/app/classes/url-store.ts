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

  /*****  *****/
  static WEBSOCKET_URL = 'http://localhost:8080/socket';
}
