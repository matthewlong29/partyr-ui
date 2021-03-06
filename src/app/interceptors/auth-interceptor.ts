import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, scheduled, throwError } from 'rxjs';
import { switchMap, catchError, tap, mergeMap } from 'rxjs/operators';
import { AppAuthService } from '../services/app-auth.service';
import { Router } from '@angular/router';
import { URLStore } from '../classes/constants/url-store';
import { asap } from 'rxjs/internal/scheduler/asap';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(readonly appAuthSvc: AppAuthService, readonly router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes('/api')) {
      if (request.url.includes('/google-authenticate')) {
        return next.handle(request);
      }
      return this.appAuthSvc.getAuthIdToken().pipe(
        switchMap((idToken: string) => {
          request = request.clone({
            setHeaders: {
              Authorization: `${idToken}`
            }
          });
          return next.handle(request);
        })
      );
    }
    return next.handle(request);
  }
}
