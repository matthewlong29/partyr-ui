import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { LoginGuard } from './login-guard';
import { LoginComponent } from './components/views/login/login.component';
import { HomeComponent } from './components/views/home/home.component';
import { LobbyComponent } from './components/views/lobby/lobby.component';
import { GameSelectComponent } from 'src/app/components/views/game-select/game-select.component';
import { WaitingRoomComponent } from './components/views/waiting-room/waiting-room.component';

const routes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    canActivate: [LoginGuard],
    component: LoginComponent
  },
  {
    path: 'home',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    component: HomeComponent
  },
  {
    path: 'game-select',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    component: GameSelectComponent
  },
  {
    path: 'lobby/:game',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    component: LobbyComponent,
    children: []
  },
  {
    path: 'lobby/:game/:roomName',
    pathMatch: 'full',
    component: WaitingRoomComponent
  },
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
