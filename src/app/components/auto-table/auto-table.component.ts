import { Component, OnInit, Input } from '@angular/core';
import { AutoTableColumn } from 'src/app/classes/models/frontend/auto-table-column';

@Component({
  selector: 'app-auto-table',
  templateUrl: './auto-table.component.html',
  styleUrls: ['./auto-table.component.scss']
})
export class AutoTableComponent implements OnInit {
  @Input()
  columns: AutoTableColumn[];

  @Input()
  dataSource: any[];

  constructor() {}

  ngOnInit() {}
}
