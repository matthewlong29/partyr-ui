import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth-guard";
import { LoginGuard } from "./login-guard";
import { LoginComponent } from "./components/login/login.component";
import { HomeComponent } from "./components/views/home/home.component";
import { URLStore } from "./classes/url-store";
import { LobbyComponent } from "./components/views/lobby/lobby.component";

const routes: Routes = [
  {
    path: "login",
    pathMatch: "full",
    canActivate: [LoginGuard],
    component: LoginComponent
  },
  {
    path: "home",
    pathMatch: "full",
    canActivate: [AuthGuard],
    component: HomeComponent
  },
  {
    path: "lobby",
    pathMatch: "full",
    canActivate: [AuthGuard],
    component: LobbyComponent
  },
  { path: "**", pathMatch: "full", redirectTo: "home" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
