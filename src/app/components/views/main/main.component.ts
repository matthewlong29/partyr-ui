import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { UserService } from 'src/app/services/user.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: [ './main.component.scss' ]
})
export class MainComponent implements OnInit {
  currUser = new BehaviorSubject<PartyrUser>(undefined);

  constructor(readonly userSvc: UserService) {}

  ngOnInit() {
    this.userSvc.getCurrentUser().pipe().subscribe((user: PartyrUser) => {
      this.currUser.next(user);
    });
  }
}
