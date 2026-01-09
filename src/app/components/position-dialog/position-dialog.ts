import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../../models/org-chart.models';

@Component({
  selector: 'app-position-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2>Create New Position</h2>
      <button mat-icon-button (click)="onCancel()" class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="form-group">
        <label class="field-label">Name <span class="required">*</span></label>
        <input class="custom-input" [(ngModel)]="positionName" placeholder="Enter position name" />
      </div>

      <div class="form-group">
        <label class="field-label">Name (Thai)</label>
        <input
          class="custom-input"
          [(ngModel)]="positionNameThai"
          placeholder="ชื่อตำแหน่งภาษาไทย"
        />
      </div>

      <div class="form-group">
        <label class="field-label">Name (Chinese)</label>
        <input class="custom-input" [(ngModel)]="positionNameChinese" placeholder="中文职位名称" />
      </div>

      <div class="form-group">
        <label class="field-label">Name (Vietnamese)</label>
        <input
          class="custom-input"
          [(ngModel)]="positionNameVietnamese"
          placeholder="Tên vị trí tiếng Việt"
        />
      </div>

      <div class="form-group">
        <label class="field-label">Section</label>
        <select class="custom-input" [(ngModel)]="section">
          <option value="">Select section</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      <div class="form-group">
        <label class="field-label">Salary Type <span class="required">*</span></label>
        <mat-radio-group [(ngModel)]="salaryType" class="radio-group">
          <mat-radio-button value="normal" color="warn">Normal</mat-radio-button>
          <mat-radio-button value="commission" color="warn">Commission</mat-radio-button>
        </mat-radio-group>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button (click)="onCancel()" class="cancel-button">Cancel</button>
      <button
        mat-raised-button
        [disabled]="!positionName || !salaryType"
        (click)="onCreate()"
        class="create-button"
      >
        <mat-icon>add</mat-icon>
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      ::ng-deep .mat-dialog-container {
        border-radius: 12px;
        padding: 0;
        max-width: 550px;
        width: 100%;
        font-family: Arial, sans-serif;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }

      /* Header */
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 24px;
        background-color: #f0f0f0;
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }

      /* Close Button */
      .dialog-header .close-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px;
      }

      /* Content */
      mat-dialog-content {
        padding: 24px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      /* Form Group */
      .form-group {
        display: flex;
        flex-direction: column;
      }

      .field-label {
        font-weight: 500;
        margin-bottom: 6px;
        color: #333;
      }

      .required {
        color: red;
      }

      /* Inputs & Select */
      .custom-input {
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 14px;
      }

      .custom-input:focus {
        outline: none;
        border-color: #666;
      }

      /* Radio Buttons */
      .radio-group {
        display: flex;
        gap: 20px;
        margin-top: 5px;
      }

      /* Actions */
      mat-dialog-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        padding: 20px;
        background-color: #f0f0f0;
      }

      /* Cancel Button */
      .cancel-button {
        border: 1px solid #EE1E52;
        background-color: #fff;
        color: #EE1E52;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
      }

      .cancel-button:hover {
        background-color: #EE1E52;
        color: #fff;
      }

      /* Create Button */
      .create-button {
        background-color: #EE1E52;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .create-button[disabled] {
        background-color: #EE1E52;
        cursor: not-allowed;
      }
    `,
  ],
})
export class PositionDialogComponent {
  private dialogRef = inject(MatDialogRef<PositionDialogComponent>);

  positionName = '';
  positionNameThai = '';
  positionNameChinese = '';
  positionNameVietnamese = '';
  section = '';
  salaryType = 'normal';

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.positionName && this.salaryType) {
      const position: Position = {
        id: `pos_${Date.now()}`,
        name: this.positionName,
        code: this.positionName.substring(0, 3).toUpperCase(),
        nameThai: this.positionNameThai,
        nameChinese: this.positionNameChinese,
        nameVietnamese: this.positionNameVietnamese,
        section: this.section,
        salaryType: this.salaryType,
      };
      this.dialogRef.close(position);
    }
  }
}
