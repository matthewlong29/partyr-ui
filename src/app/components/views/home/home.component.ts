import { Component, OnInit } from '@angular/core';
import { ImagePaths } from 'src/app/classes/constants/image-paths';
import { Router } from '@angular/router';
import { AppAuthService } from 'src/app/services/app-auth.service';
import { URLStore } from 'src/app/classes/constants/url-store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  imagePaths = [ImagePaths.MAFIA_BANNER];

  constructor(readonly appAuthSvc: AppAuthService, readonly router: Router) {}

  ngOnInit() {}

  signOut(): void {
    this.appAuthSvc.signOut().subscribe();
  }

  enterGameSelect(): void {
    this.router.navigate([URLStore.GAME_SELECT_URL]);
  }
}
