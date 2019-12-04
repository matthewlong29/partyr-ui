import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { SocialService } from 'src/app/services/social.service';
import { Relationship } from 'src/app/classes/models/shared/relationship';
import { PartyrUser } from 'src/app/classes/models/shared/PartyrUser';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, Subscription, BehaviorSubject, scheduled } from 'rxjs';
import { MatDialog } from '@angular/material';
import { AddFriendComponent } from '../../dialogs/add-friend/add-friend.component';
import { RelationshipRespObject } from 'src/app/classes/models/shared/resp-objects.ts/relationship-resp-object';
import { asap } from 'rxjs/internal/scheduler/asap';
import { UserChatInstance } from 'src/app/classes/models/frontend/user-chat-instance';
import { FormBuilder } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
import { Message } from 'src/app/classes/models/shared/Message';

@Component({
  selector: 'app-social-bar',
  templateUrl: './social-bar.component.html',
  styleUrls: [ './social-bar.component.scss' ]
})
export class SocialBarComponent implements OnInit, OnDestroy {
  currUser = new BehaviorSubject<PartyrUser>(undefined);
  friendsList = new BehaviorSubject<PartyrUser[]>([]);
  blockList = new BehaviorSubject<PartyrUser[]>([]);

  friendsListExpanded = new BehaviorSubject<boolean>(false);

  chatInstances = new BehaviorSubject<UserChatInstance[]>([]);

  newMsgCtrl = this.fb.control('');

  constructor(
    readonly fb: FormBuilder,
    readonly chatSvc: ChatService,
    readonly userSvc: UserService,
    readonly socialSvc: SocialService,
    readonly dialog: MatDialog
  ) {}

  subs: Subscription[] = [];

  ngOnInit() {
    this.subs.push(
      this.getAllRelationships().subscribe(({ friendsList, blockedList }) => this.updateLists(friendsList, blockedList))
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  addFriend() {
    this.dialog
      .open(AddFriendComponent)
      .afterClosed()
      .pipe(
        switchMap((friendName: string) => {
          if (friendName && this.currUser) {
            const currUsername = this.currUser.getValue().username;
            return this.socialSvc.addFriend(currUsername, friendName).pipe(switchMap(() => this.getAllRelationships()));
          }
          return scheduled([], asap);
        })
      )
      .subscribe(({ friendsList, blockedList }) => this.updateLists(friendsList, blockedList));
  }

  getAllRelationships(): Observable<RelationshipRespObject> {
    return this.userSvc
      .getCurrentUser()
      .pipe(
        tap((currUser: PartyrUser) => this.currUser.next(currUser)),
        switchMap((user: PartyrUser) => this.socialSvc.getAllRelationships(user.username))
      );
  }

  updateLists(friendsList?: PartyrUser[], blockedList?: PartyrUser[]) {
    if (friendsList) {
      this.friendsList.next(friendsList);
    }
    if (blockedList) {
      this.blockList.next(blockedList);
    }
  }

  toggleFriendsList() {
    const expanded = this.friendsListExpanded.getValue();
    this.friendsListExpanded.next(!expanded);
  }

  openNewChatInstance(chatTarget: string) {
    const currInstances: UserChatInstance[] = this.chatInstances.getValue();
    const newInstance: UserChatInstance = { chatTarget, isOpen: true };
    const foundInstance: boolean = !!currInstances.find(
      (testInstance: UserChatInstance) => testInstance.chatTarget === chatTarget
    );
    if (!foundInstance) {
      currInstances.push(newInstance);
      this.chatInstances.next(currInstances);
    }
  }

  toggleChatInstance(instance: UserChatInstance) {
    const currInstances: UserChatInstance[] = this.chatInstances.getValue();
    const instanceIndex: number = currInstances.findIndex(
      (testInstance: UserChatInstance) => testInstance.chatTarget === instance.chatTarget
    );
    if (instanceIndex >= 0) {
      currInstances[instanceIndex].isOpen = !instance.isOpen;
    }
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const msg: Message = new Message(
        this.newMsgCtrl.value,
        this.currUser.getValue().username,
        new Date().toISOString()
      );
      this.chatSvc.sendToChat(msg);
      this.newMsgCtrl.reset(null);
    }
  }
}
