import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-department-dialog',
  standalone: true,
  imports: [
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './add-department-dialog.html',
  styleUrl: './add-department-dialog.css',
})
export class AddDepartmentDialogComponent {
  deptForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    // The DialogRef must refer to THIS component
    private dialogRef: MatDialogRef<AddDepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { schoolId: number }
  ) {
    this.deptForm = this.fb.group({
      name: ['', Validators.required],
      head_of_department: [''],
      description: [''],
      school_id: [data.schoolId] // Pre-filled from parent
    });
  }

  // Just send the data back to the parent
  save() {
    if (this.deptForm.valid) {
      this.dialogRef.close(this.deptForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}