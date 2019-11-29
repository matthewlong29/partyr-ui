import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URLStore } from '../classes/constants/url-store';
import { Relationship } from '../classes/models/shared/relationship';
import { RelationshipRespObject } from '../classes/models/shared/resp-objects.ts/relationship-resp-object';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  constructor(readonly http: HttpClient) {}

  getAllRelationships(username: string): Observable<RelationshipRespObject> {
    return this.http.post<RelationshipRespObject>(URLStore.GET_ALL_RELATIONSHIPS, { username });
  }

  addFriend(currUser: string, friend: string): Observable<boolean> {
    const relationship: Relationship = {
      relatingUsername: currUser,
      relatedUsername: friend,
      relationshipStatus: 'FRIEND'
    };
    return this.http.post<boolean>(URLStore.CREATE_RELATIONSHIP, relationship);
  }

  blockUser(currUser: string, blockUser: string): Observable<boolean> {
    const relationship: Relationship = {
      relatingUsername: currUser,
      relatedUsername: blockUser,
      relationshipStatus: 'BLOCK'
    };
    return this.http.post<boolean>(URLStore.CREATE_RELATIONSHIP, relationship);
  }
}
