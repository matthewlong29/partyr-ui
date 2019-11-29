export interface Relationship {
  relatingUsername: string;
  relatedUsername: string;
  relationshipStatus: 'BLOCK' | 'FRIEND';
}
