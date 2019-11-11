import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { BehaviorSubject, concat, Subscription } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { map } from 'rxjs/operators';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomName = this.route.snapshot.paramMap.get('roomName');
  roomDetails = new BehaviorSubject<LobbyRoom>(undefined);
  currUser = new BehaviorSubject<PartyrUser>(undefined);

  subscriptions: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly lobbySvc: LobbyService,
    readonly userSvc: UserService
  ) {}

  ngOnInit() {
    this.subscriptions.push(this.subToRoomChanges());
    this.subscriptions.push(this.getCurrUser());
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  subToRoomChanges(): Subscription {
    return concat(
      this.lobbySvc.getAvailableRooms(),
      this.lobbySvc.watchAvailableRooms()
    )
      .pipe(
        map((rooms: LobbyRoom[]) =>
          rooms.find((room: LobbyRoom) => room.gameRoomName === this.roomName)
        )
      )
      .subscribe((foundRoom?: LobbyRoom) => {
        this.roomDetails.next(foundRoom);
      });
  }

  /** getPlayersInRoom
   * @desc return an array of the players in the room
   */
  getPlayersInRoom(): string[] {
    const room: LobbyRoom = this.roomDetails.getValue();
    if (room) {
      return [...room.playersReady, ...room.playersNotReady];
    }
    return [];
  }

  /** backToLobby
   * @desc navigate to the page with all the available rooms
   */
  backToLobby(): void {
    const paths: string[] = this.route.snapshot.pathFromRoot[1].url.map(
      (segment: UrlSegment) => segment.path
    );
    this.router.navigateByUrl(`/${paths[0]}/${paths[1]}`);
  }

  /** getCurrUser
   * @desc get and set the class variable to the current user
   */
  getCurrUser(): Subscription {
    return this.userSvc
      .getCurrentUser()
      .subscribe((user: PartyrUser) => this.currUser.next(user));
  }

  /** isUserHost
   * @desc determine if this room is hosted by the user and show/hide certain display parts if so
   */
  isUserHost(userName?: string): boolean {
    const currUser: PartyrUser | undefined = this.currUser.getValue();
    const user = userName || (currUser && currUser.userName);
    const room: LobbyRoom | undefined = this.roomDetails.getValue();
    console.log(room.hostEmail);
    return currUser && room && user === room.hostEmail;
  }

  /** deleteRoom
   * @desc delete the room with the specified name
   */
  deleteRoom(): void {
    const room: LobbyRoom | undefined = this.roomDetails.getValue();
    if (room) {
      this.lobbySvc.deleteRoom(room.gameRoomName);
    }
  }
}
