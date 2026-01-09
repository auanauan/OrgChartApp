import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { OrgNode } from '../../models/org-chart.models';

export interface ParentSelectorData {
  possibleParents: OrgNode[];
  positionName: string;
}

export interface ParentSelectorResult {
  parentId: string;
  permissions: {
    approveLeave: boolean;
    viewLeave: boolean;
    approveExpense: boolean;
    viewExpense: boolean;
  };
}

@Component({
  selector: 'app-parent-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Select Parent for "{{ data.positionName }}"</h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <p class="subtitle">Please select a parent node from Level {{ getParentLevel() }}</p>

        <div class="parent-list">
          <div
            *ngFor="let parent of data.possibleParents"
            class="parent-option"
            [class.selected]="selectedParentId === parent.id"
            (click)="selectParent(parent.id)"
          >
            <mat-icon class="parent-icon">account_tree</mat-icon>
            <span class="parent-name">{{ parent.positionName }}</span>
          </div>
        </div>

        <div *ngIf="data.possibleParents.length === 0" class="no-parents">
          No available parent nodes in previous level
        </div>

        <div class="permissions-section" *ngIf="selectedParentId">
          <h3>Permissions</h3>
          <div class="permissions-grid">
            <div class="permission-item">
              <mat-checkbox [(ngModel)]="permissions.approveLeave" color="primary">
                Approve Leave
              </mat-checkbox>
            </div>
            <div class="permission-item">
              <mat-checkbox [(ngModel)]="permissions.viewLeave" color="primary">
                View Leave
              </mat-checkbox>
            </div>
            <div class="permission-item">
              <mat-checkbox [(ngModel)]="permissions.approveExpense" color="primary">
                Approve Expense
              </mat-checkbox>
            </div>
            <div class="permission-item">
              <mat-checkbox [(ngModel)]="permissions.viewExpense" color="primary">
                View Expense
              </mat-checkbox>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="onCancel()" class="cancel-button">Cancel</button>
        <button
          mat-raised-button
          [disabled]="!selectedParentId"
          (click)="onConfirm()"
          class="confirm-button"
        >
          Confirm
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
          sans-serif;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 50px;
        margin: -24px -24px 0 -24px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .close-button {
        width: 32px;
        height: 32px;
        color: #666;
      }

      mat-dialog-content {
        width: 100%;
        max-height: 90vh;
        overflow: auto;
        padding: 24px;
      }

      .subtitle {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #666;
      }

      .parent-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 24px;
      }

      .parent-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }

      .parent-option:hover {
        border-color: #d81b60;
        background-color: #fce4ec;
      }

      .parent-option.selected {
        border-color: #d81b60;
        background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
        color: white;
      }

      .parent-icon {
        color: #666;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .parent-option.selected .parent-icon {
        color: white;
      }

      .parent-name {
        font-size: 15px;
        font-weight: 500;
        flex: 1;
      }

      .no-parents {
        padding: 32px 20px;
        text-align: center;
        color: #999;
        font-style: italic;
        font-size: 14px;
      }

      .permissions-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e0e0e0;
      }

      .permissions-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .permissions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .permission-item {
        display: flex;
        align-items: center;
      }

      ::ng-deep .permission-item .mat-mdc-checkbox {
        width: 100%;
      }

      ::ng-deep .permission-item .mat-mdc-checkbox label {
        font-size: 14px;
        color: #333;
      }

      ::ng-deep .mat-mdc-checkbox.mat-primary .mdc-checkbox__background {
        border-color: #d81b60 !important;
      }

      ::ng-deep .mat-mdc-checkbox.mat-primary.mat-mdc-checkbox-checked .mdc-checkbox__background {
        background-color: #d81b60 !important;
        border-color: #d81b60 !important;
      }

      mat-dialog-actions {
        padding: 50px !important;
        margin: 0 -24px -24px -24px !important;
        border-top: 1px solid #e0e0e0;
        display: flex !important;
        justify-content: center !important;
        gap: 12px !important;
        background: white;
      }

      .cancel-button {
        min-width: 100px;
        height: 40px;
        border-radius: 20px;
        border: 2px solid #e91e63 !important;
        color: #e91e63 !important;
        font-weight: 500;
        background: white !important;
        font-size: 14px;
      }

      .cancel-button:hover {
        background: #fce4ec !important;
      }

      .confirm-button {
        min-width: 100px;
        height: 40px;
        border-radius: 20px;
        background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%) !important;
        color: white !important;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
      }

      .confirm-button:hover:not(:disabled) {
        background: linear-gradient(135deg, #c2185b 0%, #ad1457 100%) !important;
        box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
      }

      .confirm-button:disabled {
        background: #e0e0e0 !important;
        color: #999 !important;
        box-shadow: none !important;
      }

      mat-dialog-content::-webkit-scrollbar {
        display: none;
        width: 0;
      }

      mat-dialog-content::-webkit-scrollbar-track {
        display: none;
      }

      mat-dialog-content::-webkit-scrollbar-thumb {
        display: none;
      }

      mat-dialog-content::-webkit-scrollbar-thumb:hover {
        display: none;
      }

      mat-dialog-content {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
        width: 600px;
        max-width: 90vw;
        max-height: 95vh;
        margin: 20px;
        border-radius: 12px;
        overflow: hidden;
      }
    `,
  ],
})
export class ParentSelectorDialogComponent {
  private dialogRef = inject(MatDialogRef<ParentSelectorDialogComponent>);
  data = inject<ParentSelectorData>(MAT_DIALOG_DATA);

  selectedParentId: string | null = null;
  permissions = {
    approveLeave: false,
    viewLeave: true,
    approveExpense: false,
    viewExpense: true,
  };

  selectParent(parentId: string): void {
    this.selectedParentId = parentId;
  }

  getParentLevel(): number {
    return this.data.possibleParents.length > 0 ? this.data.possibleParents[0].level : 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedParentId) {
      const result: ParentSelectorResult = {
        parentId: this.selectedParentId,
        permissions: this.permissions,
      };
      this.dialogRef.close(result);
    }
  }
}
