import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ColDef, themeQuartz } from 'ag-grid-community';

@Component({
  selector: 'app-instances',
  imports: [CommonModule, AgGridAngular, MatCardModule, MatButtonModule],
  templateUrl: './instances.component.html',
  styleUrl: './instances.component.scss'
})
export class InstancesComponent implements OnInit, AfterViewInit {
  // Pagination properties
  currentPage = 0;
  pageSize = 50;
  totalItems = 0;
  totalPages = 0;
  isLoading = false;
  
  // Make Math available in template
  Math = Math;
  
  rowData: any[] = [];
  isBrowser = typeof window !== 'undefined';
  templateIdToTriggerTime: Record<string, string> = {};
  templateIdToName: Record<string, string> = {};
  colDefs: ColDef[] = [
    { 
      headerName: 'Template', 
      cellRenderer: (p: any) => this.formatTemplateDisplay(p.data?.templateId),
      width: 200
    },
    { 
      field: 'country', 
      headerName: 'Country',
      cellRenderer: (p: any) => this.formatFieldForDisplay(p.data?.country)
    },
    { 
      field: 'region', 
      headerName: 'Region',
      cellRenderer: (p: any) => this.formatFieldForDisplay(p.data?.region)
    },

    { 
      field: 'flowType', 
      headerName: 'Flow',
      cellRenderer: (p: any) => this.formatFieldForDisplay(p.data?.flowType)
    },
    { 
      field: 'clientId', 
      headerName: 'Client',
      cellRenderer: (p: any) => this.formatFieldForDisplay(p.data?.clientId)
    },
    { 
      field: 'productType', 
      headerName: 'Product Type',
      cellRenderer: (p: any) => this.formatFieldForDisplay(p.data?.productType)
    },
    { 
      field: 'status', headerName: 'Status',
      cellRenderer: (p: any) => {
        const status = p.value;
        let color: string;
        let title: string;
        
        switch (status) {
          case 'ACTIVE':
            color = '#4caf50'; // green
            title = 'Active - Ready to execute when scheduled';
            break;
          case 'SUSPENDED':
            color = '#c62828'; // red
            title = 'Suspended - Paused/disabled, will not execute';
            break;
          default:
            color = '#757575'; // gray
            title = status || 'Unknown';
        }
        
        const bulb = `<span title="${title}" aria-label="${title}" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 0 2px rgba(0,0,0,0.06);margin-right:6px;"></span>`;
        return `${bulb}${status ?? ''}`;
      }
    },
    { 
      field: 'zoneId', 
      headerName: 'Zone',
      cellRenderer: (p: any) => this.formatFieldForDisplay(p.data?.zoneId)
    },
    { 
      field: 'lastSuccessAt', 
      headerName: 'Last Execution', 
      valueGetter: p => {
        const lastSuccess = p.data?.lastSuccessAt;
        if (!lastSuccess) return 'Never';
        return new Date(lastSuccess).toLocaleString();
      }
    },
  ];
  defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  selectedIds: string[] = [];
  gridApi: any;
  theme = themeQuartz.withParams({
    // customize if desired
  });

  constructor(private api: ApiService, private router: Router) {
    // Sync pagination state with URL parameters (only in browser)
    if (typeof window !== 'undefined') {
      this.syncPaginationWithUrl();
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Load templates first to build trigger time and name maps, then load instances
      this.api.listTemplates().subscribe(templates => {
        this.templateIdToTriggerTime = Object.fromEntries(
          (templates || []).map((t: any) => [t.id, t.triggerTime || ''])
        );
        this.templateIdToName = Object.fromEntries(
          (templates || []).map((t: any) => [t.id, t.name || 'Unknown Template'])
        );
        this.loadInstances(0); // Start with first page
        
        // After loading first page, check if we need to determine total count
        setTimeout(() => {
          this.determineTotalCount();
        }, 1000);
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

  onSelectionChanged(event: any) {
    const selected = event.api.getSelectedRows() as any[];
    this.selectedIds = selected.map(r => r.id);
  }

  reload() {
    // Refresh template maps first, then load instances
    this.refreshTemplateMaps();
    this.loadInstances(this.currentPage);
  }

  private refreshTemplateMaps() {
    this.api.listTemplates().subscribe(templates => {
      this.templateIdToTriggerTime = Object.fromEntries(
        (templates || []).map((t: any) => [t.id, t.triggerTime || ''])
      );
      this.templateIdToName = Object.fromEntries(
        (templates || []).map((t: any) => [t.id, t.name || 'Unknown Template'])
      );
    });
  }

  loadInstances(page: number) {
    this.isLoading = true;
    this.currentPage = page;
    
    console.log(`Loading instances for page ${page}, size ${this.pageSize}`);
    
    this.api.listInstances({ page, size: this.pageSize }).subscribe({
      next: (data: any) => {
        console.log('Received instances data:', data);
        
        // Handle both array response and paginated response
        if (Array.isArray(data)) {
          this.rowData = data;
          // For array responses, we need to estimate pagination
          if (data.length === this.pageSize) {
            // If we got a full page, there might be more data
            this.totalItems = this.pageSize * (page + 1) + 1; // Estimate there's at least one more
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          } else {
            // This is likely the last page
            this.totalItems = this.pageSize * page + data.length;
            this.totalPages = page + 1;
          }
        } else if (data && data.content) {
          // Paginated response with metadata
          this.rowData = data.content || [];
          this.totalItems = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        } else {
          this.rowData = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        
        console.log(`Page ${page}: ${this.rowData.length} instances, Total: ${this.totalItems}, Pages: ${this.totalPages}`);
        
        this.isLoading = false;
        // Update URL with current pagination state
        this.updateUrlWithPagination();
        // Auto-resize columns after data loads
        this.resizeColumnsAfterDataLoad();
      },
      error: (error) => {
        console.error('Error loading instances:', error);
        this.isLoading = false;
        this.rowData = [];
      }
    });
  }

  goToPage(page: number) {
    console.log(`goToPage called with page ${page}, current totalPages: ${this.totalPages}`);
    // Allow navigation to any non-negative page if we don't know totalPages yet
    if (page >= 0) {
      if (this.totalPages === 0 || page < this.totalPages) {
        console.log(`Loading page ${page}`);
        this.loadInstances(page);
      } else {
        // If totalPages is known, clamp to valid range
        const clampedPage = Math.max(0, Math.min(page, this.totalPages - 1));
        console.log(`Page ${page} out of range, clamping to ${clampedPage}`);
        this.loadInstances(clampedPage);
      }
    } else {
      console.log(`Invalid page number: ${page}`);
    }
  }

  nextPage() {
    console.log(`nextPage called, current: ${this.currentPage}, totalPages: ${this.totalPages}`);
    // Allow navigation if we don't know totalPages yet, or if we're not at the last page
    if (this.totalPages === 0 || this.currentPage < this.totalPages - 1) {
      console.log(`Moving to next page: ${this.currentPage + 1}`);
      this.loadInstances(this.currentPage + 1);
    } else {
      console.log(`Cannot go to next page: current=${this.currentPage}, totalPages=${this.totalPages}`);
    }
  }

  previousPage() {
    console.log(`previousPage called, current: ${this.currentPage}`);
    if (this.currentPage > 0) {
      console.log(`Moving to previous page: ${this.currentPage - 1}`);
      this.loadInstances(this.currentPage - 1);
    } else {
      console.log(`Cannot go to previous page: current=${this.currentPage}`);
    }
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page
    this.updateUrlWithPagination(); // Update URL immediately
    this.loadInstances(0);
  }

  goToFirstPage() {
    this.loadInstances(0);
  }

  goToLastPage() {
    if (this.totalPages > 0) {
      this.loadInstances(this.totalPages - 1);
    }
  }

  /**
   * Handles the case where current page becomes empty after operations
   * and navigates to the appropriate page
   */
  private handlePageEmptyAfterOperation() {
    if (this.rowData.length === 0 && this.totalPages > 0) {
      // If current page is empty and we're not on the first page, go to previous page
      if (this.currentPage > 0) {
        this.loadInstances(this.currentPage - 1);
      } else {
        // If we're on first page and it's empty, reset to page 0
        this.loadInstances(0);
      }
    }
  }

  /**
   * Syncs pagination state with URL parameters
   */
  private syncPaginationWithUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      const sizeParam = urlParams.get('size');
      
      if (pageParam) {
        this.currentPage = Math.max(0, parseInt(pageParam) - 1);
      }
      
      if (sizeParam) {
        const size = parseInt(sizeParam);
        if ([25, 50, 100, 200].includes(size)) {
          this.pageSize = size;
        }
      }
    } catch (error) {
      console.warn('Could not sync pagination with URL:', error);
    }
  }

  /**
   * Updates URL with current pagination state
   */
  private updateUrlWithPagination() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', (this.currentPage + 1).toString());
      url.searchParams.set('size', this.pageSize.toString());
      
      // Update URL without reloading the page
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Could not update URL with pagination:', error);
    }
  }

  /**
   * Helper method to handle select change events
   */
  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.changePageSize(+target.value);
    }
  }

  /**
   * Helper method to handle page input change events
   */
  onPageInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.goToPage(+target.value - 1);
    }
  }

  /**
   * Helper method to handle page input keyup events
   */
  onPageInputKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      if (target && target.value) {
        this.goToPage(+target.value - 1);
      }
    }
  }

  /**
   * Determines the total count by checking if there are more pages
   */
  private determineTotalCount() {
    if (this.totalPages === 0 && this.rowData.length === this.pageSize) {
      console.log('Checking if there are more pages...');
      // Try to fetch the next page to see if there's more data
      this.api.listInstances({ page: 1, size: this.pageSize }).subscribe({
        next: (data: any) => {
          if (Array.isArray(data) && data.length > 0) {
            console.log(`Found more data on page 1: ${data.length} items`);
            // Update total count based on finding more data
            this.totalItems = this.pageSize + data.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            console.log(`Updated total: ${this.totalItems} items, ${this.totalPages} pages`);
          } else {
            console.log('No more data found, this is the last page');
            this.totalItems = this.rowData.length;
            this.totalPages = 1;
          }
        },
        error: (error) => {
          console.log('Error checking for more pages:', error);
          // Assume this is all the data
          this.totalItems = this.rowData.length;
          this.totalPages = 1;
        }
      });
    }
  }

  /**
   * Test method to manually test pagination
   */
  testPagination() {
    console.log('=== Testing Pagination ===');
    console.log('Current page:', this.currentPage);
    console.log('Page size:', this.pageSize);
    console.log('Total items:', this.totalItems);
    console.log('Total pages:', this.totalPages);
    console.log('Row data length:', this.rowData.length);
    console.log('Is loading:', this.isLoading);
    console.log('=======================');
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

  private formatFieldForDisplay(value: any): string {
    if (!value || value === '' || value === null || value === undefined) {
      return '<span style="color: #9e9e9e; font-style: italic;">—</span>';
    }
    return value;
  }

  private formatTemplateDisplay(templateId: string): string {
    if (!templateId) {
      return '<span style="color: #9e9e9e; font-style: italic;">—</span>';
    }
    
    const templateName = this.templateIdToName[templateId];
    const triggerTime = this.templateIdToTriggerTime[templateId];
    
    if (templateName) {
      let displayText = templateName;
      if (triggerTime) {
        displayText += ` <span style="color: #666; font-size: 0.9em;">(${triggerTime})</span>`;
      }
      return `<span title="ID: ${templateId}" style="cursor: help;">${displayText}</span>`;
    }
    
    // Fallback to ID if name not found
    return `<span style="color: #ff9800; font-style: italic;">${templateId}</span>`;
  }

  suspendSelected() {
    if (!this.selectedIds.length) { return; }
    this.api.suspendInstances(this.selectedIds).subscribe(() => {
      this.loadInstances(this.currentPage); // Refresh current page
      this.selectedIds = [];
      this.handlePageEmptyAfterOperation();
    });
  }

  resumeSelected() {
    if (!this.selectedIds.length) { return; }
    this.api.resumeInstances(this.selectedIds).subscribe(() => {
      this.loadInstances(this.currentPage); // Refresh current page
      this.selectedIds = [];
      this.handlePageEmptyAfterOperation();
    });
  }

  triggerSelected() {
    if (this.selectedIds.length) {
      this.api.triggerInstances(this.selectedIds).subscribe(() => {
        this.loadInstances(this.currentPage); // Refresh current page
        this.selectedIds = [];
        this.handlePageEmptyAfterOperation();
      });
    }
  }



  viewExecutions() {
    if (this.selectedIds.length === 1) {
      // Navigate to executions page with instance filter
      this.router.navigate(['/executions'], { 
        queryParams: { instanceId: this.selectedIds[0] } 
      });
    }
  }
}
