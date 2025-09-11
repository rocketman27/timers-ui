import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimerCreateDialogComponent } from './create-dialog/timer-create-dialog.component';
import { TimerEditDialogComponent } from './edit-dialog/timer-edit-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { ApiService } from '../../core/api.service';
import { switchMap, forkJoin, of, catchError } from 'rxjs';

@Component({
  selector: 'app-timers',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './timers.component.html',
  styleUrl: './timers.component.scss'
})
export class TimersComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  isBrowser = typeof window !== 'undefined';
  selectedIds: string[] = [];
  gridApi: any;
  colDefs: ColDef[] = [
    { field: 'name', headerName: 'Name' },
    {
      headerName: 'Status',
      valueGetter: p => p.data?.suspended ? 'SUSPENDED' : 'ACTIVE',
      cellRenderer: (p: any) => {
        const status = p.value;
        let color: string;
        let title: string;
        switch (status) {
          case 'ACTIVE': color = '#4caf50'; title = 'Active - Ready to execute when scheduled'; break;
          case 'SUSPENDED': color = '#c62828'; title = 'Suspended - Paused/disabled, will not execute'; break;
          default: color = '#757575'; title = status || 'Unknown';
        }
        const bulb = `<span title="${title}" aria-label="${title}" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 0 2px rgba(0,0,0,0.06);margin-right:6px;"></span>`;
        return `${bulb}${status ?? ''}`;
      }
    },
    { field: 'zoneId', headerName: 'Zone' },
    { field: 'triggerTime', headerName: 'Trigger Time' },
    { colId: 'countries', headerName: 'Countries', valueGetter: p => this.formatListForDisplay(p.data?.countries || []), cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.countries || []) },
    { colId: 'regions', headerName: 'Regions', valueGetter: p => this.formatListForDisplay(p.data?.regions || []), cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.regions || []) },
    { colId: 'excludedCountries', headerName: 'Excluded Countries', valueGetter: p => this.formatListForDisplay(p.data?.excludedCountries || []), cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.excludedCountries || []) },
    { colId: 'flowTypes', headerName: 'Flow Types', valueGetter: p => this.formatListForDisplay(p.data?.flowTypes || []), cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.flowTypes || []) },
    { colId: 'clientIds', headerName: 'Client IDs', valueGetter: p => this.formatListForDisplay(p.data?.clientIds || []), cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.clientIds || []) },
    { colId: 'productTypes', headerName: 'Product Types', valueGetter: p => this.formatListForDisplay(p.data?.productTypes || []), cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.productTypes || []) },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  theme = themeQuartz.withParams({});

  constructor(private api: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    if (this.isBrowser) {
      this.api.listTimers().subscribe(d => {
        this.rowData = d;
        this.resizeColumnsAfterDataLoad();
        setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); this.gridApi.refreshCells(); } }, 50);
        setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); this.gridApi.refreshCells(); } }, 200);
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => { this.resizeColumnsAfterDataLoad(); }, 100);
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 300);
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); this.gridApi.refreshCells(); } }, 600);
    }
  }

  private resizeColumnsAfterDataLoad(): void {
    if (this.gridApi) {
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 50);
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 200);
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 500);
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 1000);
      setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); this.gridApi.refreshCells(); } }, 1500);
    }
  }

  onSelectionChanged(event: any) { const selected = event.api.getSelectedRows() as any[]; this.selectedIds = selected.map(r => r.id); }
  onGridReady(event: any) {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
    if (this.rowData && this.rowData.length > 0) { this.resizeColumnsAfterDataLoad(); }
    this.gridApi.addEventListener('modelUpdated', () => { setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 100); });
    window.addEventListener('resize', () => { setTimeout(() => { if (this.gridApi) { this.gridApi.sizeColumnsToFit(); this.gridApi.autoSizeAllColumns(); } }, 100); });
  }

  create() {
    const ref = this.dialog.open(TimerCreateDialogComponent, { panelClass: 'resizable-dialog', width: 'auto', maxWidth: '95vw', height: 'auto', maxHeight: '95vh' });
    ref.afterClosed().subscribe(ok => { if (ok) { this.showNotification('🔄 Refreshing timers...', 'info'); this.api.listTimers().subscribe({ next: (d) => { this.rowData = d; this.showNotification('✅ Timer created successfully', 'success'); }, error: (error) => { const errorMessage = this.extractErrorMessage(error); this.showNotification(`❌ Failed to refresh timers: ${errorMessage}`, 'error'); } }); } });
  }

  edit(row: any) {
    const ref = this.dialog.open(TimerEditDialogComponent, { panelClass: 'resizable-dialog', width: 'auto', maxWidth: '95vw', height: 'auto', maxHeight: '95vh' });
    (ref.componentInstance as any).prefill(row);
    ref.afterClosed().subscribe(ok => { if (ok) { this.showNotification('🔄 Refreshing timers...', 'info'); this.api.listTimers().subscribe({ next: (d) => { this.rowData = d; this.showNotification('✅ Timer updated successfully', 'success'); }, error: (error) => { const errorMessage = this.extractErrorMessage(error); this.showNotification(`❌ Failed to refresh timers: ${errorMessage}`, 'error'); } }); } });
  }

  editSelected() { if (this.selectedIds.length === 1) { const selectedRow = this.rowData.find(row => row.id === this.selectedIds[0]); if (selectedRow) { this.edit(selectedRow); } } }
  delete(templateId: string) { this.rowData = this.rowData.filter(t => t.id !== templateId); }

  suspendSelected() {
    if (!this.selectedIds.length) { return; }
    const suspendPromises = this.selectedIds.map(templateId => {
      return this.api.getTimer(templateId).pipe(
        switchMap(template => {
          const updateRequest = { name: template.name, description: template.description, cronExpression: template.cronExpression, zoneId: template.zoneId, triggerTime: template.triggerTime, suspended: true, countries: template.countries || [], regions: template.regions || [], flowTypes: template.flowTypes || [], clientIds: template.clientIds || [], productTypes: template.productTypes || [] };
          return this.api.updateTimer(templateId, updateRequest);
        }),
      );
    });
    forkJoin(suspendPromises).subscribe({ next: () => { this.rowData.forEach(template => { if (this.selectedIds.includes(template.id)) { template.suspended = true; } }); this.rowData = [...this.rowData]; const templateCount = this.selectedIds.length; this.showNotification(`✅ ${templateCount} timer(s) suspended successfully`, 'success'); this.selectedIds = []; }, error: (error) => { const errorMessage = this.extractErrorMessage(error); this.showNotification(`❌ Failed to suspend timers: ${errorMessage}`, 'error'); } });
  }

  resumeSelected() {
    if (!this.selectedIds.length) { return; }
    const resumePromises = this.selectedIds.map(templateId => {
      return this.api.getTimer(templateId).pipe(
        switchMap(template => {
          const updateRequest = { name: template.name, description: template.description, cronExpression: template.cronExpression, zoneId: template.zoneId, triggerTime: template.triggerTime, suspended: false, countries: template.countries || [], regions: template.regions || [], flowTypes: template.flowTypes || [], clientIds: template.clientIds || [], productTypes: template.productTypes || [] };
          return this.api.updateTimer(templateId, updateRequest);
        }),
      );
    });
    forkJoin(resumePromises).subscribe({ next: () => { this.rowData.forEach(template => { if (this.selectedIds.includes(template.id)) { template.suspended = false; } }); this.rowData = [...this.rowData]; const templateCount = this.selectedIds.length; this.showNotification(`✅ ${templateCount} timer(s) resumed successfully`, 'success'); this.selectedIds = []; }, error: (error) => { const errorMessage = this.extractErrorMessage(error); this.showNotification(`❌ Failed to resume timers: ${errorMessage}`, 'error'); } });
  }

  triggerSelected() {
    if (!this.selectedIds.length) { return; }
    const ids = this.selectedIds;
    const plural = ids.length > 1;
    this.showNotification(`⏱️ Triggering ${ids.length} timer${plural ? 's' : ''}...`, 'info');
    const call$ = ids.length === 1 ? this.api.triggerTimer(ids[0]) : this.api.triggerTimers(ids);
    call$.subscribe({ next: () => { this.showNotification(`✅ Triggered ${ids.length} timer${plural ? 's' : ''}`, 'success'); }, error: (error) => { const msg = this.extractErrorMessage(error); this.showNotification(`❌ Failed to trigger: ${msg}`, 'error'); } });
  }

  deleteSelected() {
    if (!this.selectedIds.length) { return; }
    const templateCount = this.selectedIds.length;
    const templateNames = this.rowData.filter(t => this.selectedIds.includes(t.id)).map(t => t.name).join(', ');
    const selectedTemplates = this.rowData.filter(t => this.selectedIds.includes(t.id));
    const confirmationMessage = selectedTemplates.map(t => `• ${t.name}`).join('\n');
    const confirmRef = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete timers', message: confirmationMessage, confirmText: 'Delete', cancelText: 'Cancel' } });
    confirmRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) { return; }
      this.showNotification(`🗑️ Deleting ${templateCount} timer(s): ${templateNames}`, 'info');
      const deletePromises = this.selectedIds.map(templateId => { return this.api.deleteTimer(templateId).pipe(switchMap(() => of({ success: true, templateId })), catchError((error) => of({ success: false, templateId, error })) ); });
      forkJoin(deletePromises).subscribe({ next: (results) => { this.rowData = this.rowData.filter(template => !this.selectedIds.includes(template.id)); this.selectedIds = []; const successfulDeletes = results.filter(r => r.success); const failedDeletes = results.filter(r => !r.success); if (failedDeletes.length === 0) { this.showNotification(`✅ Successfully deleted ${templateCount} timer(s) via backend`, 'success'); } else if (successfulDeletes.length === 0) { this.showNotification(`⚠️ Backend delete not available, removed ${templateCount} timer(s) locally only`, 'info'); } else { this.showNotification(`⚠️ Partially successful: ${successfulDeletes.length} deleted via backend, ${failedDeletes.length} removed locally`, 'info'); } }, error: (error) => { const errorMessage = this.extractErrorMessage(error); this.showNotification(`❌ Failed to delete timers: ${errorMessage}`, 'error'); } });
    });
  }

  private formatListForDisplay(items: string[]): string { if (!items || items.length === 0) return '<span style="color: #9e9e9e; font-style: italic;">—</span>'; if (items.length <= 3) return items.join(', '); return `${items.slice(0, 2).join(', ')} <span style=\"color: #1976d2; font-weight: 500;\">+${items.length - 2} more</span>`; }
  private createListCellRenderer(displayValue: string, fullList: string[]): string { if (!fullList || fullList.length === 0) return displayValue; if (fullList.length <= 3) return displayValue; const fullText = fullList.join(', '); return `<span title="${fullText}" style="cursor: help;">${displayValue}</span>`; }
  private showNotification(message: string, type: 'success' | 'error' | 'info') { const panelClass = type === 'success' ? 'success-snackbar' : type === 'error' ? 'error-snackbar' : 'info-snackbar'; this.snackBar.open(message, 'Close', { duration: type === 'error' ? 5000 : 3000, panelClass: [panelClass], horizontalPosition: 'end', verticalPosition: 'top' }); }
  private extractErrorMessage(error: any): string { if (error?.error?.message) return error.error.message; if (error?.message) return error.message; if (error?.status) return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`; if (typeof error === 'string') return error; return 'Unknown error occurred'; }
}


