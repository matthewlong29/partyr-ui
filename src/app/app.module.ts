import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './auth-guard';
import { HeaderComponent } from './components/layout/header/header.component';
import { JumbotronComponent } from './components/jumbotron/jumbotron.component';
import {
  AuthServiceConfig,
  GoogleLoginProvider,
  SocialLoginModule
} from 'angularx-social-login';
import { UserService } from './services/user.service';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { LoginGuard } from './login-guard';
import { CredentialsInterceptor } from './interceptors/credentials-interceptor';
import { AppAuthService } from './services/app-auth.service';
import { GSignInComponent } from './components/utils/g-sign-in/g-sign-in.component';
import { MenuComponent } from './components/utils/menu/menu.component';
import { MenuItemDirective } from './components/utils/menu/menu-item.directive';

const GOOGLE_OAUTH_CLIENT_ID = '276174427953-o7q6mv623adttteep82an71rs4bgge0r';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(GOOGLE_OAUTH_CLIENT_ID)
  }
]);

export const provideConfig = () => config;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    JumbotronComponent,
    GSignInComponent,
    MenuComponent,
    MenuItemDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    HttpClientModule
  ],
  providers: [
    AuthGuard,
    LoginGuard,
    UserService,
    AppAuthService,
    { provide: AuthServiceConfig, useFactory: provideConfig },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
