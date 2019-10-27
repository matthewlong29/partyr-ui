import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoTableComponent } from 'src/app/components/auto-table/auto-table.component';

const APP_UTILS: any[] = [AutoTableComponent];

@NgModule({
  declarations: APP_UTILS,
  imports: [CommonModule],
  exports: APP_UTILS
})
export class UtilsModule {}
