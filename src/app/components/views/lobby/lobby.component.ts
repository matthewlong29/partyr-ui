import { Component, OnInit } from '@angular/core';
import { AutoTableColumn } from 'src/app/classes/models/auto-table-column';
import { BehaviorSubject } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';
import { LobbyService } from 'src/app/services/lobby.service';
import { map } from 'rxjs/operators';

const AVAILABLE_ROOMS_COLS: AutoTableColumn[] = [
  new AutoTableColumn('name', 'Room'),
  new AutoTableColumn('fillRatio', 'Players'),
  new AutoTableColumn('join', 'Join')
];

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  availableRoomsCols: AutoTableColumn[] = AVAILABLE_ROOMS_COLS;
  availableRooms = new BehaviorSubject<any[]>([]);

  constructor(readonly lobbySvc: LobbyService) {}

  ngOnInit() {
    this.lobbySvc
      .getAvailableRooms()
      .subscribe((rooms: any[]) => this.availableRooms.next(rooms));
  }
}
