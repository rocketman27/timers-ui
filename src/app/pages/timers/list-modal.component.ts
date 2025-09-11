import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-list-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <div style="max-height: 400px; overflow-y: auto;">
        <div *ngFor="let item of data.items" style="padding: 8px 0; border-bottom: 1px solid #eee;">
          {{ item }}
        </div>
      </div>
    </div>
    <div mat-dialog-actions style="justify-content: flex-end;">
      <button mat-raised-button (click)="close()">Close</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ListModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ListModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; items: string[] }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
