import { Component, OnInit } from '@angular/core';
import { AutoTableColumn } from 'src/app/classes/models/auto-table-column';
import { BehaviorSubject } from 'rxjs';
import { LobbyRoom } from 'src/app/classes/models/lobby-room';

const AVAILABLE_ROOMS_COLS: AutoTableColumn[] = [
  new AutoTableColumn('name', 'Room'),
  new AutoTableColumn('fillRatio', 'Players')
];

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  availableRoomsCols: AutoTableColumn[] = AVAILABLE_ROOMS_COLS;
  dataSource = new BehaviorSubject<any[]>([]);

  constructor() {}

  ngOnInit() {}
}
