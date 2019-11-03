export interface LobbyRoom {
  gameRoomName: string;
  gameName: string;
  hostEmail: string;
  players: string[];
  numberOfPlayers: number;
  gameStarted: boolean;
  gameStartTime: string;
  gameEndTime: string;
}
