import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  InjectableRxStompConfig,
  RxStompService,
  rxStompServiceFactory
} from '@stomp/ng2-stompjs';
import {
  AuthServiceConfig,
  GoogleLoginProvider,
  SocialLoginModule
} from 'angularx-social-login';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth-guard';
import { ChatComponent } from './components/chat/chat.component';
import { JumbotronComponent } from './components/jumbotron/jumbotron.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { GSignInComponent } from './components/utils/g-sign-in/g-sign-in.component';
import { MenuItemDirective } from './components/utils/menu/menu-item.directive';
import { MenuComponent } from './components/utils/menu/menu.component';
import { HomeComponent } from './components/views/home/home.component';
import { LobbyComponent } from './components/views/lobby/lobby.component';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { CredentialsInterceptor } from './interceptors/credentials-interceptor';
import { LoginGuard } from './login-guard';
import { myRxStompConfig } from './rx-stomp.config';
import { AppAuthService } from './services/app-auth.service';
import { UserService } from './services/user.service';
import { GameSelectComponent } from './components/game-select/game-select.component';
import { UtilsModule } from './modules/utils/utils.module';

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
    MenuItemDirective,
    ChatComponent,
    LobbyComponent,
    GameSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    HttpClientModule,
    UtilsModule
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
    },
    {
      provide: InjectableRxStompConfig,
      useValue: myRxStompConfig
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
