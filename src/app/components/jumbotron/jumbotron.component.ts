import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-jumbotron',
  templateUrl: './jumbotron.component.html',
  styleUrls: ['./jumbotron.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JumbotronComponent implements OnInit {
  @Input()
  imageSrcs: string[];

  activeImgSrc = new BehaviorSubject<string>('');

  constructor() {}

  ngOnInit() {
    console.log(this.imageSrcs);
    if (this.imageSrcs && this.imageSrcs.length) {
      this.activeImgSrc.next(this.imageSrcs[0]);
    }
  }
}
