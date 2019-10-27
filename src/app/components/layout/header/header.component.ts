import { Component, OnInit } from '@angular/core';
import { AppAuthService } from 'src/app/services/app-auth.service';
import { Router } from '@angular/router';
import { URLStore } from 'src/app/classes/url-store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(readonly appAuthSvc: AppAuthService, readonly router: Router) {}

  ngOnInit() {}

  signOut() {
    this.appAuthSvc.signOut().subscribe();
  }

  isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }

  navigateHome(): void {
    this.router.navigateByUrl(URLStore.HOME_URL);
  }
}
