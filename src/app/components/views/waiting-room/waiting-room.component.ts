import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from 'src/app/services/lobby.service';
import { BehaviorSubject, concat, Subscription } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { map } from 'rxjs/operators';
import { PartyrUser } from 'src/app/classes/models/PartyrUser';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomName = this.route.snapshot.paramMap.get('roomName');
  roomDetails = new BehaviorSubject<LobbyRoom>(undefined);

  subscriptions: Subscription[] = [];

  constructor(
    readonly route: ActivatedRoute,
    readonly lobbySvc: LobbyService
  ) {}

  ngOnInit() {
    this.subscriptions.push(this.subToRoomChanges());
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
}
