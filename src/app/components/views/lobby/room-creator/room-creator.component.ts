import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { GameObject } from 'src/app/classes/models/game-object';
import { MAT_DIALOG_DATA } from '@angular/material';
import { GameStore } from 'src/app/classes/constants/game-store';

@Component({
  selector: 'app-room-creator',
  templateUrl: './room-creator.component.html',
  styleUrls: ['./room-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomCreatorComponent implements OnInit {
  gameDetails?: GameObject;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly gameName,
    readonly gameSvc: GamesService
  ) {}

  ngOnInit() {}

  isBlackHand(): boolean {
    return this.gameName === GameStore.BLACK_HAND_NAME;
  }
}
