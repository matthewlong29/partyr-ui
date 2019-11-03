import { EventEmitter } from '@angular/core';

export interface RoomCreator {
  closeRoomCreator: EventEmitter<any>;
}
