import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ColDef, themeQuartz } from 'ag-grid-community';

@Component({
  selector: 'app-executions',
  imports: [
    CommonModule, 
    AgGridAngular, 
    MatCardModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule,
    FormsModule
  ],
  templateUrl: './executions.component.html',
  styleUrl: './executions.component.scss'
})
export class ExecutionsComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  isBrowser = typeof window !== 'undefined';
  
  // Filter options
  selectedInstanceId: string = '';
  selectedOutcome: string = '';
  selectedTriggerType: string = '';
  
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'Execution ID', width: 120 },
    { field: 'instanceId', headerName: 'Instance ID', width: 120 },
    { 
      field: 'scheduledFor', 
      headerName: 'Scheduled For', 
      width: 150,
      valueFormatter: p => {
        if (!p.value) return '';
        return new Date(p.value).toLocaleString();
      }
    },
    { 
      field: 'startedAt', 
      headerName: 'Started At', 
      width: 150,
      valueFormatter: p => {
        if (!p.value) return 'Not started';
        return new Date(p.value).toLocaleString();
      }
    },
    { 
      field: 'finishedAt', 
      headerName: 'Finished At', 
      width: 150,
      valueFormatter: p => {
        if (!p.value) return 'In progress';
        return new Date(p.value).toLocaleString();
      }
    },
    { 
      field: 'outcome', 
      headerName: 'Outcome', 
      width: 120,
      cellRenderer: (p: any) => {
        const outcome = p.value;
        if (!outcome) return '<span style="color: #1976d2;">In Progress</span>';
        
        let color: string;
        let text: string;
        
        switch (outcome) {
          case 'SUCCESS':
            color = '#4caf50';
            text = '✅ Success';
            break;
          case 'FAILED':
            color = '#f44336';
            text = '❌ Failed';
            break;
          case 'SKIPPED':
            color = '#ff9800';
            text = '⏭️ Skipped';
            break;
          default:
            color = '#757575';
            text = outcome;
        }
        
        return `<span style="color: ${color}; font-weight: 500;">${text}</span>`;
      }
    },
    { 
      field: 'triggerType', 
      headerName: 'Trigger Type', 
      width: 120,
      cellRenderer: (p: any) => {
        const triggerType = p.value;
        switch (triggerType) {
          case 'SCHEDULED':
            return '🕐 Scheduled';
          case 'MANUAL':
            return '👆 Manual';
          default:
            return triggerType;
        }
      }
    },
    { 
      field: 'errorMessage', 
      headerName: 'Error Details', 
      width: 200,
      cellRenderer: (p: any) => {
        if (!p.value) return '';
        return `<span title="${p.value}" style="color: #f44336; cursor: help;">${p.value.length > 30 ? p.value.substring(0, 30) + '...' : p.value}</span>`;
      }
    },
    { 
      field: 'duration', 
      headerName: 'Duration', 
      width: 100,
      valueGetter: p => {
        const started = p.data?.startedAt;
        const finished = p.data?.finishedAt;
        
        if (!started) return '';
        if (!finished) return 'Running...';
        
        const duration = new Date(finished).getTime() - new Date(started).getTime();
        if (duration < 1000) return '< 1s';
        if (duration < 60000) return `${Math.round(duration / 1000)}s`;
        return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;
      }
    }
  ];
  
  defaultColDef: ColDef = { 
    sortable: true, 
    filter: true, 
    resizable: true
  };
  
  theme = themeQuartz.withParams({});
  gridApi: any;

  constructor(
    private api: ApiService, 
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.isBrowser) {
      // Check for query parameters (e.g., when navigating from instances page)
      this.route.queryParams.subscribe(params => {
        if (params['instanceId']) {
          this.selectedInstanceId = params['instanceId'];
        }
        this.loadExecutions();
      });
    }
  }

  ngAfterViewInit(): void {
    // Additional resize after view initialization
    if (this.isBrowser) {
      setTimeout(() => {
        this.resizeColumnsAfterDataLoad();
      }, 100);
    }
  }

  loadExecutions() {
    this.api.listExecutions({ page: 0, size: 100 }).subscribe(d => {
      this.rowData = d || [];
      this.applyFilters();
      // Auto-resize columns after data loads
      this.resizeColumnsAfterDataLoad();
    });
  }

  private resizeColumnsAfterDataLoad(): void {
    if (this.gridApi) {
      // Use multiple timeouts to ensure the grid has fully rendered
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
      }, 50);
      
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
      }, 200);
      
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
      }, 500);
    }
  }

  applyFilters() {
    this.filteredData = this.rowData.filter(execution => {
      let matches = true;
      
      if (this.selectedInstanceId && execution.instanceId !== this.selectedInstanceId) {
        matches = false;
      }
      
      if (this.selectedOutcome && execution.outcome !== this.selectedOutcome) {
        matches = false;
      }
      
      if (this.selectedTriggerType && execution.triggerType !== this.selectedTriggerType) {
        matches = false;
      }
      
      return matches;
    });
  }

  clearFilters() {
    this.selectedInstanceId = '';
    this.selectedOutcome = '';
    this.selectedTriggerType = '';
    this.applyFilters();
    
    // Clear query parameters
    this.router.navigate(['/executions']);
  }

  getUniqueInstanceIds(): string[] {
    return [...new Set(this.rowData.map(e => e.instanceId))].sort();
  }

  getUniqueOutcomes(): string[] {
    return [...new Set(this.rowData.map(e => e.outcome).filter(o => o))].sort();
  }

  getUniqueTriggerTypes(): string[] {
    return [...new Set(this.rowData.map(e => e.triggerType))].sort();
  }

  getExecutionCount(outcome: string): number {
    return this.rowData.filter(e => e.outcome === outcome).length;
  }

  getInProgressCount(): number {
    return this.rowData.filter(e => !e.outcome).length;
  }

  onGridReady(event: any) {
    event.api.sizeColumnsToFit();
    
    // Store grid API for later use
    this.gridApi = event.api;
    
    // Auto-resize columns when data changes
    this.gridApi.addEventListener('modelUpdated', () => {
      setTimeout(() => this.gridApi?.sizeColumnsToFit(), 100);
    });
    
    // Auto-resize columns on window resize
    window.addEventListener('resize', () => {
      setTimeout(() => this.gridApi?.sizeColumnsToFit(), 100);
    });
  }
}
