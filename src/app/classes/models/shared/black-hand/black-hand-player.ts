import { BlackHandRoleObject } from './black-hand-role-object';
import { Faction } from 'src/app/classes/constants/type-aliases';

export interface BlackHandPlayer {
  username: string;
  displayName: string;
  preferredFaction: Faction;
  actualFaction: Faction;
  blocksAgainst: number;
  attacksAgainst: number;
  timesVotedToBePlacedOnTrial: number;
  hasVoted: boolean;
  hasAttacked: boolean;
  hasBlocked: boolean;
  turnPriority: number;
  role: BlackHandRoleObject;
  notes: string[];
}
