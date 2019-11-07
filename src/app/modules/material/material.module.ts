import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCheckboxModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatDialogModule,
  MatDividerModule,
  MatButtonModule,
  MatListModule,
  MatGridListModule,
  MatSnackBarModule,
  MatTableModule
} from '@angular/material';

const MAT_MODULES = [
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatCardModule,
  MatDividerModule,
  MatButtonModule,
  MatListModule,
  MatGridListModule,
  MatDialogModule,
  MatSnackBarModule,
  MatTableModule
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...MAT_MODULES],
  exports: [...MAT_MODULES]
})
export class MaterialModule {}
