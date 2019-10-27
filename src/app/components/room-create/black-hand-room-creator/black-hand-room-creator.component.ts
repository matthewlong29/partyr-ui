import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { BlackHandService } from 'src/app/services/black-hand.service';
import { BlackHandRoleObject } from 'src/app/classes/models/black-hand/black-hand-role-object';
import { BlackHandRoleRespObject } from 'src/app/classes/models/black-hand/black-hand-role-resp-object';
import { FormBuilder, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-black-hand-room-creator',
  templateUrl: './black-hand-room-creator.component.html',
  styleUrls: ['./black-hand-room-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlackHandRoomCreatorComponent implements OnInit {
  blackHandRoles: BlackHandRoleObject[] = [];
  monsterRoles: BlackHandRoleObject[] = [];
  townieRoles: BlackHandRoleObject[] = [];

  rolesForm = this.fb.group({});

  roomForm = this.fb.group({
    nameCtrl: this.fb.control('', [Validators.required]),
    pwCtrl: this.fb.control(''),
    rolesForm: this.rolesForm
  });

  constructor(
    readonly bhSvc: BlackHandService,
    readonly fb: FormBuilder,
    readonly cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.bhSvc
      .getBlackHandRoles()
      .subscribe((roles: BlackHandRoleRespObject) => {
        Object.keys(roles).forEach((factionName: string) => {
          roles[factionName].forEach((role: BlackHandRoleObject) => {
            const roleCtrl = this.fb.control(true);
            if (factionName === 'BlackHand') {
              roleCtrl.disable();
            }
            this.rolesForm.addControl(role.name, roleCtrl);
          });
        });

        this.blackHandRoles = roles.BlackHand;
        this.monsterRoles = roles.Monster;
        this.townieRoles = roles.Townie;

        this.cdRef.markForCheck();
      });
  }

  createRoom() {
    if (this.roomForm.valid) {
      console.log(this.roomForm.value);
    }
  }
}
