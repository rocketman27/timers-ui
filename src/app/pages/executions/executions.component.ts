import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef} from 'ag-grid-community';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {ApiService} from '../../core/api.service';

@Component({
  selector: 'app-executions',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './executions.component.html',
  styleUrl: './executions.component.scss'
})
export class ExecutionsComponent implements OnInit {
  isBrowser = typeof window !== 'undefined';
  selectedTimerId = '';
  selectedOutcome = '';
  selectedTriggerType = '';
  currentPage = 0;
  pageSize = 20;

  colDefs: ColDef[] = [
    {field: 'id', headerName: 'Execution ID'},
    {field: 'timerId', headerName: 'Timer ID'},
    {field: 'timerName', headerName: 'Timer Name'},
    {field: 'scheduledFor', headerName: 'Scheduled For'},
    {field: 'startedAt', headerName: 'Started At'},
    {field: 'finishedAt', headerName: 'Finished At'},
    {field: 'outcome', headerName: 'Outcome'},
    {field: 'triggerType', headerName: 'Trigger'}
  ];

  rowData: any[] = [];
  filteredData: any[] = [];
  defaultColDef: ColDef = {sortable: true, filter: true, resizable: true};
  theme = undefined as any;
  gridApi: any;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    // optional theme init to avoid undefined binding errors
    try {
      // lazy import to avoid SSR issues
      const {themeQuartz} = require('ag-grid-community');
      this.theme = themeQuartz.withParams({});
    } catch {
    }
    this.loadExecutions();
  }

  loadExecutions(): void {
    this.api.listExecutions({page: this.currentPage, size: this.pageSize}).subscribe(list => {
      this.rowData = Array.isArray(list) ? list : [];
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredData = this.rowData.filter(e => {
      if (this.selectedTimerId && e.timerId !== this.selectedTimerId) return false;
      if (this.selectedOutcome && e.outcome !== this.selectedOutcome) return false;
      if (this.selectedTriggerType && e.triggerType !== this.selectedTriggerType) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.selectedTimerId = '';
    this.selectedOutcome = '';
    this.selectedTriggerType = '';
    this.applyFilters();
  }

  getExecutionCount(status: string): number {
    return this.rowData.filter(e => e.outcome === status).length;
  }

  getInProgressCount(): number {
    return this.rowData.filter(e => !e.finishedAt && e.startedAt).length;
  }

  getUniqueTimerIds(): string[] {
    const ids = new Set<string>();
    for (const e of this.rowData) {
      if (e.timerId) ids.add(e.timerId);
    }
    return Array.from(ids);
  }

  getUniqueOutcomes(): string[] {
    const s = new Set<string>();
    for (const e of this.rowData) {
      if (e.outcome) s.add(e.outcome);
    }
    return Array.from(s);
  }

  getUniqueTriggerTypes(): string[] {
    const s = new Set<string>();
    for (const e of this.rowData) {
      if (e.triggerType) s.add(e.triggerType);
    }
    return Array.from(s);
  }

  onGridReady(event: any): void {
    this.gridApi = event?.api;
    if (this.gridApi) {
      try {
        this.gridApi.sizeColumnsToFit();
      } catch {
      }
    }
  }

  nextPage(): void {
    this.currentPage += 1;
    this.api.listExecutions({page: this.currentPage, size: this.pageSize}).subscribe(list => {
      const data = Array.isArray(list) ? list : [];
      if (data.length === 0 && this.currentPage > 0) {
        this.currentPage -= 1; // revert if no data
        return;
      }
      this.rowData = data;
      this.applyFilters();
    });
  }

  prevPage(): void {
    if (this.currentPage === 0) {
      return;
    }
    this.currentPage -= 1;
    this.loadExecutions();
  }
}
