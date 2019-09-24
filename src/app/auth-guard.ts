import { CanActivate } from '@angular/router/src/utils/preactivation';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppAuthService } from './services/app-auth.service';
import { URLStore } from './classes/url-store';

@Injectable()
export class AuthGuard implements CanActivate {
  path: ActivatedRouteSnapshot[];
  route: ActivatedRouteSnapshot;

  constructor(readonly router: Router, readonly appAuthSvc: AppAuthService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.appAuthSvc
      .getIsLoggedIn()
      .pipe(
        map(
          (loggedIn: boolean) =>
            loggedIn || this.router.parseUrl(URLStore.LOGIN_URL)
        )
      );
  }
}
