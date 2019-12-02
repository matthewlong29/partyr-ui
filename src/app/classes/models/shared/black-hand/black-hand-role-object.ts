import { Faction } from 'src/app/classes/constants/type-aliases';

export interface BlackHandRoleObject {
  name: string;
  faction: Faction;
  goalDescription: string;
  attributeDescription: string;
  dayAbilityDescription: string;
  nightAbilityDescription: string;
  spritePath: string;
  rolePriority: number;
  canAttack: boolean;
  canBlock: boolean;
}
