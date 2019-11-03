import { CanActivate } from '@angular/router/src/utils/preactivation';
import { Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppAuthService } from './services/app-auth.service';
import { URLStore } from './classes/constants/url-store';
import { asap } from 'rxjs/internal/scheduler/asap';

@Injectable()
export class LoginGuard implements CanActivate {
  path: ActivatedRouteSnapshot[];
  route: ActivatedRouteSnapshot;

  constructor(readonly router: Router, readonly appAuthSvc: AppAuthService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.appAuthSvc.getIsLoggedIn().pipe(
      map(
        (loggedIn: boolean) =>
          !loggedIn || this.router.parseUrl(URLStore.HOME_URL)
      ),
      catchError((err: any) => {
        console.error(err);
        return scheduled([true], asap);
      })
    );
  }
}
