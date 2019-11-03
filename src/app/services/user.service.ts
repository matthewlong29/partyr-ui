import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { Observable, scheduled } from 'rxjs';
import { PartyrUser } from '../classes/models/PartyrUser';
import { URLStore } from '../classes/constants/url-store';
import { switchMap, first } from 'rxjs/operators';
import { asap } from 'rxjs/internal/scheduler/asap';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: PartyrUser;

  constructor(readonly authService: AuthService, readonly http: HttpClient) {}

  /**
   * @desc getCurrentUser
   */
  public getCurrentUser(): Observable<PartyrUser> {
    return this.currentUser
      ? scheduled([this.currentUser], asap)
      : this.authService.authState.pipe(
          first(),
          switchMap((socialUser: SocialUser) =>
            this.getPartyrUserByEmail(socialUser.email)
          )
        );
  }
  /**
   * getPartyrUserByEmail.
   */
  public getPartyrUserByEmail(partyrEmail: string): Observable<PartyrUser> {
    return this.http.post<PartyrUser>(URLStore.CURRENT_USER, { partyrEmail });
  }
}
