export class URLStore {
  //***** CLIENT ROUTES *****/
  static LOGIN_URL = '/login';
  static HOME_URL = '/home';
  static GAME_SELECT_URL = '/game-select';
  static LOBBY_URL = '/lobby';

  /***** NODE ENDPOINTS *****/
  // static LOGGED_IN_URL = '/logged-in';
  static CURRENT_USER = 'api/users/current-user';
  static CHAT_MESSAGES = 'api/chat';
  static AUTH_ID_TOKEN_URL = '/auth-id-token';

  /***** AUTHENTICATION *****/
  static GOOGLE_SIGN_IN_URL = '/api/google-authenticate';
  static CHECK_AUTH_URL = 'api/check-auth';

  /***** WEBSOCKET *****/
  static WEBSOCKET_URL = '/ws/socket';

  /***** GAMES SERVICE *****/
  static GET_ALL_GAMES_URL = 'api/games';
  static GET_GAME_DETAILS_URL = 'api/game';

  /***** LOBBY SERVICE *****/
  static GET_AVAILABLE_ROOMS = 'api/lobby-rooms';

  /***** BLACK HAND SERVICE *****/
  static GET_BH_ROLES = 'api/game/details/black-hand/roles';
}
