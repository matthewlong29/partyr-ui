import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { GameObject } from 'src/app/classes/models/game-object';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

const BLACK_HAND_NAME = 'BlackHand';

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

  ngOnInit() {
    console.log(this.gameName);
  }

  isBlackHand(): boolean {
    return this.gameName === BLACK_HAND_NAME;
  }
}
