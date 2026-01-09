import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  hasChildren: boolean;
  childCount?: number;
  parentName?: string | null;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <button mat-icon-button class="close" (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="header">
        <div class="alert-icon">!</div>
        <div>
          <div class="title">{{ data.title }}</div>
          <div class="subtitle">{{ data.message }}</div>
          <div class="hint" *ngIf="data.hasChildren">
            โหนดนี้มีลูก {{ data.childCount || 0 }} ตำแหน่ง
            <span *ngIf="data.parentName"> | ถ้าย้ายลูกจะต่อกับ {{ data.parentName }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="data.hasChildren" class="options">
        <label>
          <input
            type="radio"
            name="deleteOption"
            [(ngModel)]="moveChildrenUp"
            [value]="false"
            checked
          />
          ลบโหนดนี้และลูกทั้งหมด
        </label>
        <label>
          <input type="radio" name="deleteOption" [(ngModel)]="moveChildrenUp" [value]="true" />
          ลบโหนดนี้และย้ายลูกขึ้นไปต่อกับโหนดแม่
        </label>
      </div>

      <div class="actions">
        <button mat-stroked-button color="primary" class="ghost" (click)="onCancel()">No</button>
        <button mat-raised-button color="warn" class="confirm" (click)="onConfirm()">Yes</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        position: relative;
        min-width: 380px;
        padding: 24px 24px 20px 24px;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
        font-family: 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif;
      }

      .close {
        position: absolute;
        top: 8px;
        right: 8px;
        color: #555;
      }

      .header {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .alert-icon {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f66 0%, #d32f2f 100%);
        color: #fff;
        font-weight: 800;
        font-size: 18px;
        box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35);
        flex-shrink: 0;
      }

      .title {
        font-weight: 700;
        font-size: 16px;
        color: #2d2d2d;
        margin-bottom: 4px;
      }

      .subtitle {
        font-size: 13px;
        color: #5f5f5f;
        line-height: 1.5;
      }

      .hint {
        margin-top: 6px;
        font-size: 12px;
        color: #8a6d3b;
        background: #fff7e6;
        border: 1px solid #ffe0b2;
        padding: 8px 10px;
        border-radius: 10px;
        line-height: 1.4;
      }

      .options {
        margin: 18px 0 6px 0;
        padding: 12px;
        border: 1px solid #f3e5f5;
        border-radius: 10px;
        background: #fdf7ff;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .options label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #444;
        cursor: pointer;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 18px;
      }

      .ghost {
        color: #555 !important;
        border-color: #ddd !important;
        background: #fafafa !important;
        min-width: 90px;
      }

      .confirm {
        min-width: 100px;
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%) !important;
        color: #fff !important;
        box-shadow: 0 8px 18px rgba(244, 67, 54, 0.35) !important;
      }

      input[type='radio'] {
        accent-color: #d32f2f;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  moveChildrenUp = false;

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true, moveChildrenUp: this.moveChildrenUp });
  }
}
