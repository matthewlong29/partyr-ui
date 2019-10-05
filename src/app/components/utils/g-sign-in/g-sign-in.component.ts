import { Component, OnInit } from '@angular/core';
import { AppAuthService } from 'src/app/services/app-auth.service';

@Component({
  selector: 'app-g-sign-in',
  templateUrl: './g-sign-in.component.html',
  styleUrls: ['./g-sign-in.component.scss']
})
export class GSignInComponent implements OnInit {
  constructor(readonly appAuthSvc: AppAuthService) {}

  ngOnInit() {}

  googleSignIn(): void {
    this.appAuthSvc.signIn().subscribe();
  }
}
