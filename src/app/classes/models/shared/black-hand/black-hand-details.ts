import { BlackHandRoleObject } from './black-hand-role-object';
import { BlackHandPlayer } from './black-hand-player';
import { BlackHandTrial } from './black-hand-trial';
import { BlackHandSettings } from './black-hand-settings';
import { Faction, BlackHandPhase } from 'src/app/classes/constants/type-aliases';

export interface BlackHandDetails {
  roomName: string;
  gameStartTime: string;
  phase: BlackHandPhase;
  playersTurnRemaining: string[];
  playersVoteRemaining: string[];
  numOfBlackHandRemaining: number;
  numOfTownieRemaining: number;
  numOfMonsterRemaining: number;
  winningFaction: Faction;
  playerOnTrial: BlackHandTrial;
  settings: BlackHandSettings;
  deadPlayers: BlackHandPlayer[];
  alivePlayers: BlackHandPlayer[];
}
