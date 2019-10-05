import { Injectable } from '@angular/core';
import { Observable, from, combineLatest, scheduled } from 'rxjs';
import { URLStore } from '../classes/url-store';
import { HttpClient } from '@angular/common/http';
import {
  AuthService,
  GoogleLoginProvider,
  SocialUser
} from 'angularx-social-login';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { asap } from 'rxjs/internal/scheduler/asap';

@Injectable({
  providedIn: 'root'
})
export class AppAuthService {
  constructor(
    readonly http: HttpClient,
    readonly xAuthSvc: AuthService,
    readonly router: Router
  ) {}

  triggerGoogleSignInPrompt(): void {
    this.xAuthSvc.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signIn(): Observable<boolean> {
    return from(this.xAuthSvc.signIn(GoogleLoginProvider.PROVIDER_ID)).pipe(
      switchMap(() => {
        return this.xAuthSvc.authState.pipe(
          switchMap((socialUser?: SocialUser) => {
            if (!socialUser) {
              return scheduled([false], asap);
            }
            return this.http.post<boolean>(URLStore.GOOGLE_SIGN_IN_URL, {
              idToken: socialUser.idToken
            });
          }),
          tap((loggedIn: boolean) => !loggedIn || this.router.navigate(['/']))
        );
      })
    );
  }

  signOut(): Observable<any> {
    return from(this.xAuthSvc.signOut()).pipe(
      switchMap(() =>
        combineLatest([this.deleteIsLoggedIn(), this.deleteAuthIdToken()])
      ),
      tap(() => this.router.navigate([URLStore.LOGIN_URL]))
    );
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(URLStore.LOGGED_IN_URL);
  }

  deleteIsLoggedIn(): Observable<any> {
    return this.http.delete(URLStore.LOGGED_IN_URL);
  }

  getAuthIdToken(): Observable<string> {
    return this.http.get<string>(URLStore.AUTH_ID_TOKEN_URL);
  }

  deleteAuthIdToken(): Observable<any> {
    return this.http.delete(URLStore.AUTH_ID_TOKEN_URL);
  }
}
