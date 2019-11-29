import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { AppRegex } from 'src/app/classes/constants/app-regex';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: [ './add-friend.component.scss' ]
})
export class AddFriendComponent implements OnInit {
  friendCtrl = this.fb.control('', [ Validators.pattern(AppRegex.DISPLAY_NAME) ]);

  constructor(readonly fb: FormBuilder, readonly dialogRef: MatDialogRef<AddFriendComponent>) {}

  ngOnInit() {}

  submitFriendName() {
    if (this.friendCtrl.valid) {
      this.dialogRef.close(this.friendCtrl.value);
    }
  }
}
