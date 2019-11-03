import { CanActivate } from '@angular/router/src/utils/preactivation';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AppAuthService } from './services/app-auth.service';
import { URLStore } from './classes/constants/url-store';
import { asap } from 'rxjs/internal/scheduler/asap';
import { UserService } from './services/user.service';
import { SocialUser } from 'angularx-social-login';
import { PartyrUser } from './classes/models/PartyrUser';

@Injectable()
export class AuthGuard implements CanActivate {
  path: ActivatedRouteSnapshot[];
  route: ActivatedRouteSnapshot;

  constructor(
    readonly router: Router,
    readonly appAuthSvc: AppAuthService,
    readonly userSvc: UserService
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.appAuthSvc.getIsLoggedIn().pipe(
      switchMap((loggedIn: boolean) => {
        if (loggedIn) {
          if (!this.userSvc.currentUser || !this.userSvc.currentUser.email) {
            return this.appAuthSvc.xAuthSvc.authState.pipe(
              switchMap((socialUser: SocialUser) =>
                this.userSvc.getPartyrUserByEmail(socialUser.email)
              ),
              tap(
                (partyrUser: PartyrUser) =>
                  (this.userSvc.currentUser = partyrUser)
              ),
              map(() => loggedIn)
            );
          }
          return scheduled([loggedIn], asap);
        }
        return scheduled([this.router.parseUrl(URLStore.LOGIN_URL)], asap);
      }),
      catchError((err: any) => {
        console.error(err);
        return scheduled([this.router.parseUrl(URLStore.LOGIN_URL)], asap);
      })
    );
  }
}
