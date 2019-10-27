import { Injectable, EventEmitter } from '@angular/core';
import { IOConfig } from '../classes/models/io-config';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  openSignal = new EventEmitter<{ component: any; childConfig: IOConfig }>();
  closeSignal = new EventEmitter();

  constructor() {}

  open(component: any, childConfig?: IOConfig) {
    this.openSignal.emit({ component, childConfig });
  }
  close(): void {
    this.closeSignal.emit();
  }
}
