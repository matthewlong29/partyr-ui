export class URLStore {
  //***** CLIENT ROUTES *****/
  static LOGIN_URL = '/login';
  static HOME_URL = '/home';

  /***** NODE ENDPOINTS *****/
  static LOGGED_IN_URL = '/logged-in';
  static CURRENT_USER = 'api/current-user/';
  static AUTH_ID_TOKEN_URL = '/auth-id-token';

  /***** AUTHENTICATION *****/
  static GOOGLE_SIGN_IN_URL = '/api/google-authenticate';

  /*****  *****/
  static WEBSOCKET_URL = 'http://localhost:8080/socket';
}
