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
import { LoginComponent } from './components/views/login/login.component';
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
import { GameSelectComponent } from './components/views/game-select/game-select.component';
import { UtilsModule } from './modules/utils/utils.module';
import { RoomCreatorComponent } from './components/views/lobby/room-creator/room-creator.component';
import { MainComponent } from './components/views/main/main.component';
import { BlackHandRoomCreatorComponent } from './components/room-create/black-hand-room-creator/black-hand-room-creator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { WaitingRoomComponent } from './components/views/waiting-room/waiting-room.component';
import { NewUserPromptComponent } from './components/modals/new-user-prompt/new-user-prompt.component';
import { SettingsComponent } from './components/views/settings/settings.component';
import { ConfirmationDialogComponent } from './components/utils/confirmation-dialog/confirmation-dialog.component';

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
    GameSelectComponent,
    RoomCreatorComponent,
    MainComponent,
    BlackHandRoomCreatorComponent,
    NewUserPromptComponent,
    SettingsComponent,
    WaitingRoomComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    HttpClientModule,
    UtilsModule,
    BrowserAnimationsModule,
    MaterialModule
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
  entryComponents: [
    RoomCreatorComponent,
    NewUserPromptComponent,
    ConfirmationDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
