import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppAuthService } from '../services/app-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(readonly appAuthSvc: AppAuthService) {}
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
