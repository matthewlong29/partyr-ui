import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { Observable, scheduled, throwError } from 'rxjs';
import { PartyrUser } from '../classes/models/PartyrUser';
import { URLStore } from '../classes/constants/url-store';
import { switchMap, first, tap, catchError } from 'rxjs/operators';
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
    return this.currentUser && this.currentUser.email
      ? scheduled([this.currentUser], asap)
      : this.authService.authState.pipe(
          first(),
          switchMap((socialUser: SocialUser) => {
            if (socialUser) {
              return this.getPartyrUserByEmail(socialUser.email).pipe(
                tap((user: PartyrUser) => {
                  if (user.email) {
                    this.currentUser = user;
                  } else {
                    console.error('Could not find Partyr user by email');
                  }
                })
              );
            } else {
              console.error('Could not find authorized user');
              return scheduled([new PartyrUser()], asap);
            }
          })
        );
  }
  /**
   * getPartyrUserByEmail.
   */
  public getPartyrUserByEmail(email: string): Observable<PartyrUser> {
    return this.http.post<PartyrUser>(URLStore.CURRENT_USER, { email }).pipe(
      catchError((err: any) => {
        console.error(err);
        return scheduled([new PartyrUser()], asap);
      })
    );
  }
}
