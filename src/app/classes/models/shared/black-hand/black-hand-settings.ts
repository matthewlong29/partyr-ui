export interface BlackHandSettings {
  gameRoomName: string;
  lengthOfDay: number; // minutes (defaulted to 5)
  lengthOfNight: number; // minutes (defaulted to 3)
  chatOnly: boolean; // disables audio and video feature for the game
}
