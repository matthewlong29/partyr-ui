import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthService,
  GoogleLoginProvider,
  SocialUser
} from 'angularx-social-login';
import { combineLatest, from, Observable, scheduled } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { switchMap, tap } from 'rxjs/operators';
import { URLStore } from '../classes/constants/url-store';
import { UserService } from './user.service';
import { PartyrUser } from '../classes/models/shared/PartyrUser';

@Injectable({
  providedIn: 'root'
})
export class AppAuthService {
  private user: SocialUser;

  constructor(
    readonly http: HttpClient,
    readonly xAuthSvc: AuthService,
    readonly userSvc: UserService,
    readonly router: Router
  ) {}

  triggerGoogleSignInPrompt(): void {
    this.xAuthSvc.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signIn(): Observable<PartyrUser> {
    return from(this.xAuthSvc.signIn(GoogleLoginProvider.PROVIDER_ID)).pipe(
      switchMap((socialUser: SocialUser) =>
        socialUser
          ? this.http
              .post<PartyrUser>(URLStore.GOOGLE_SIGN_IN_URL, {
                idToken: socialUser.idToken
              })
              .pipe(
                tap(() => {
                  this.router.navigateByUrl('/');
                })
              )
          : scheduled([null], asap)
      )
    );
  }

  signOut(): Observable<any> {
    return from(this.xAuthSvc.signOut()).pipe(
      switchMap(() => this.deleteAuthIdToken()),
      tap(() => this.router.navigate([URLStore.LOGIN_URL]))
    );
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(URLStore.CHECK_AUTH_URL);
  }

  getAuthIdToken(): Observable<string> {
    return this.http.get<string>(URLStore.AUTH_ID_TOKEN_URL);
  }

  deleteAuthIdToken(): Observable<any> {
    return this.http.delete(URLStore.AUTH_ID_TOKEN_URL);
  }
}
