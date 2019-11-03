import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { Observable } from 'rxjs';
import { PartyrUser } from '../classes/models/PartyrUser';
import { URLStore } from '../classes/constants/url-store';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: PartyrUser;

  constructor(readonly authService: AuthService, readonly http: HttpClient) {}

  /**
   * getPartyrUserByEmail.
   */
  public getPartyrUserByEmail(partyrEmail: string): Observable<PartyrUser> {
    return this.http.post<PartyrUser>(URLStore.CURRENT_USER, { partyrEmail });
  }
}
