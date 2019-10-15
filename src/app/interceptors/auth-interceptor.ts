import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, scheduled } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AppAuthService } from '../services/app-auth.service';
import { Router } from '@angular/router';
import { URLStore } from '../classes/url-store';
import { asap } from 'rxjs/internal/scheduler/asap';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(readonly appAuthSvc: AppAuthService, readonly router: Router) {}

  chainRequest(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((err: any) => {
        console.error(err);
        this.router.navigate([URLStore.LOGIN_URL]);
        return scheduled([], asap);
      })
    );
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes('/api')) {
      if (request.url.includes('/google-authenticate')) {
        return this.chainRequest(request, next);
      }
      return this.appAuthSvc.getAuthIdToken().pipe(
        switchMap((idToken: string) => {
          request = request.clone({
            setHeaders: {
              Authorization: `${idToken}`
            }
          });
          return this.chainRequest(request, next);
        })
      );
    }
    return this.chainRequest(request, next);
  }
}
