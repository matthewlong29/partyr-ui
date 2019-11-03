import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { BlackHandService } from 'src/app/services/black-hand.service';
import { BlackHandRoleObject } from 'src/app/classes/models/black-hand/black-hand-role-object';
import { BlackHandRoleRespObject } from 'src/app/classes/models/black-hand/black-hand-role-resp-object';
import { FormBuilder, Validators } from '@angular/forms';
import { LobbyService } from 'src/app/services/lobby.service';
import { GameStore } from 'src/app/classes/constants/game-store';
import { UserService } from 'src/app/services/user.service';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';
import { RoomCreator } from 'src/app/classes/component-interfaces/room-creator';

interface RoomForm {
  nameCtrl: any;
  pwCtrl: any;
  rolesForm: any;
}

@Component({
  selector: 'app-black-hand-room-creator',
  templateUrl: './black-hand-room-creator.component.html',
  styleUrls: ['./black-hand-room-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlackHandRoomCreatorComponent implements OnInit, RoomCreator {
  @Output()
  closeRoomCreator = new EventEmitter<any>();

  blackHandRoles: BlackHandRoleObject[] = [];
  monsterRoles: BlackHandRoleObject[] = [];
  townieRoles: BlackHandRoleObject[] = [];

  rolesForm = this.fb.group({});

  roomForm = this.fb.group({
    nameCtrl: this.fb.control('', [Validators.required]),
    pwCtrl: this.fb.control(''),
    rolesForm: this.rolesForm
  } as RoomForm);

  constructor(
    readonly bhSvc: BlackHandService,
    readonly cdRef: ChangeDetectorRef,
    readonly lobbySvc: LobbyService,
    readonly userSvc: UserService,
    readonly fb: FormBuilder
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
      const formVals: RoomForm = this.roomForm.value;
      this.userSvc.getCurrentUser().subscribe((currentUser: PartyrUser) => {
        this.lobbySvc.createRoom(
          GameStore.BLACK_HAND_NAME,
          formVals.nameCtrl,
          currentUser.email
        );
        this.closeRoomCreator.emit();
      });
    }
  }
}
