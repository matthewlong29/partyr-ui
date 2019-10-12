import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { Observable } from 'rxjs';
import { PartyrUser } from '../classes/PartyrUser';
import { URLStore } from '../classes/url-store';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: SocialUser;

  constructor(readonly authService: AuthService, readonly http: HttpClient) {}

  /**
   * getPartyrUserByEmail.
   */
  public getPartyrUserByEmail(email: string): Observable<PartyrUser> {
    return this.http.get<PartyrUser>(URLStore.CURRENT_USER + email);
  }
}
