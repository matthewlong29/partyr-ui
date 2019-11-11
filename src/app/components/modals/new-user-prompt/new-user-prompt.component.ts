import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-new-user-prompt',
  templateUrl: './new-user-prompt.component.html',
  styleUrls: ['./new-user-prompt.component.scss']
})
export class NewUserPromptComponent implements OnInit {
  screenNameCtrl = this.fb.control('', [
    Validators.pattern(/[a-z0-9_\s]{3,}/i)
  ]);

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly email: string,
    readonly fb: FormBuilder,
    readonly userSvc: UserService,
    readonly dialogRef: MatDialogRef<NewUserPromptComponent>,
    readonly snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  submit(): void {
    if (this.screenNameCtrl.valid) {
      this.userSvc
        .setUserName(this.screenNameCtrl.value, this.email)
        .subscribe((success: boolean) => {
          if (success) {
            this.dialogRef.close();
          } else {
            this.snackBar.open('Please try a different user name', null, {
              duration: 3000
            });
          }
        });
      console.log(this.screenNameCtrl.value);
    }
  }
}
