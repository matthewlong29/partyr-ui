import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LocalKeyStore } from 'src/app/classes/constants/local-key-store';
import { Router } from '@angular/router';
import {
  AuthService,
  GoogleLoginProvider,
  SocialUser
} from 'angularx-social-login';
import { UserService } from 'src/app/services/user.service';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { asap } from 'rxjs/internal/scheduler/asap';
import { from, scheduled } from 'rxjs';
import { AppAuthService } from 'src/app/services/app-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
  ) {}



  ngOnInit() {}
}
