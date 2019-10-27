export interface BlackHandRoleObject {
  name: string;
  faction: 'BlackHand' | 'Monster' | 'Townie';
  goalDescription: string;
  attributeDescription: string;
  dayAbilityDescription: string;
  nightAbilityDescription: string;
}
