import { Component, OnInit } from '@angular/core';
import { ImagePaths } from 'src/app/classes/constants/image-paths';
import { Router } from '@angular/router';
import { AppAuthService } from 'src/app/services/app-auth.service';
import { URLStore } from 'src/app/classes/constants/url-store';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';
import { MatDialog } from '@angular/material';
import { NewUserPromptComponent } from '../../modals/new-user-prompt/new-user-prompt.component';
import { switchMap } from 'rxjs/operators';
import { scheduled } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  playerChecked = false;
  imagePaths = [ImagePaths.MAFIA_BANNER];

  constructor(
    readonly appAuthSvc: AppAuthService,
    readonly router: Router,
    readonly userSvc: UserService,
    readonly dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userSvc
      .getCurrentUser()
      .pipe(
        switchMap((user: PartyrUser) =>
          !user || !user.userName
            ? this.dialog
                .open(NewUserPromptComponent, {
                  data: user.email,
                  disableClose: true
                })
                .afterClosed()
            : scheduled([user], asap)
        )
      )
      .subscribe(() => {
        this.playerChecked = true;
      });
  }

  signOut(): void {
    this.appAuthSvc.signOut().subscribe();
  }

  enterGameSelect(): void {
    this.router.navigate([URLStore.GAME_SELECT_URL]);
  }
}
