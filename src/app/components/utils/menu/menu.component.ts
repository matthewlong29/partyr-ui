import {
  Component,
  OnInit,
  Input,
  ContentChildren,
  AfterContentInit,
  QueryList,
  ElementRef
} from '@angular/core';
import { MenuItemDirective } from './menu-item.directive';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() triggerType: 'icon' | 'text' = 'text';
  @Input() label = '';
  @Input() position: 'before' | 'after' = 'after';

  hidden = true;

  constructor() {}

  ngOnInit() {}

  toggle() {
    this.hidden = !this.hidden;
  }

  hide() {
    this.hidden = true;
  }
}
