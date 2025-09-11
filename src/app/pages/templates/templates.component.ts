import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TemplateCreateDialogComponent } from './template-create-dialog.component';
import { TemplateEditDialogComponent } from './template-edit-dialog.component';

import { ColDef, themeQuartz } from 'ag-grid-community';
import { ApiService } from '../../core/api.service';
import { Observable, switchMap, forkJoin, of, Observer, catchError } from 'rxjs';

@Component({
  selector: 'app-templates',
  imports: [CommonModule, FormsModule, AgGridAngular, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss'
})
export class TemplatesComponent implements OnInit, AfterViewInit {
  // Backend pagination limits
  private static readonly INSTANCE_PAGE_SIZE = 200;
  
  rowData: any[] = [];
  newTemplate = { name: '', zoneId: 'UTC', triggerTime: '10:15' } as any;
  isBrowser = typeof window !== 'undefined';
  expandedCells: Set<string> = new Set(); // Track which cells are expanded
  selectedIds: string[] = [];
  gridApi: any;
  colDefs: ColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'zoneId', headerName: 'Zone' },
    { field: 'triggerTime', headerName: 'Trigger Time' },
    { 
      colId: 'countries', 
      headerName: 'Countries', 
      valueGetter: p => this.formatListForDisplay(p.data?.countries || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.countries || [])
    },
    { 
      colId: 'regions', 
      headerName: 'Regions', 
      valueGetter: p => this.formatListForDisplay(p.data?.regions || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.regions || [])
    },
    { 
      colId: 'excludedCountries', 
      headerName: 'Excluded Countries', 
      valueGetter: p => this.formatListForDisplay(p.data?.excludedCountries || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.excludedCountries || [])
    },
    { 
      colId: 'excludedRegions', 
      headerName: 'Excluded Regions', 
      valueGetter: p => this.formatListForDisplay(p.data?.excludedRegions || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.excludedRegions || [])
    },

    { 
      colId: 'flowTypes', 
      headerName: 'Flow Types', 
      valueGetter: p => this.formatListForDisplay(p.data?.flowTypes || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.flowTypes || [])
    },
    { 
      colId: 'clientIds', 
      headerName: 'Client IDs', 
      valueGetter: p => this.formatListForDisplay(p.data?.clientIds || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.clientIds || [])
    },
    { 
      colId: 'productTypes', 
      headerName: 'Product Types', 
      valueGetter: p => this.formatListForDisplay(p.data?.productTypes || []),
      cellRenderer: (p: any) => this.createListCellRenderer(p.value, p.data?.productTypes || [])
    },
    { 
      headerName: 'Status', 
      valueGetter: p => p.data?.suspended ? 'SUSPENDED' : 'ACTIVE',
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

  ];
  defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  theme = themeQuartz.withParams({});

  constructor(private api: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.api.listTemplates().subscribe(d => {
        this.rowData = d;
        // Auto-resize columns after data loads
        this.resizeColumnsAfterDataLoad();
        
        // Force a grid refresh after data is set
        setTimeout(() => {
          if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
            this.gridApi.autoSizeAllColumns();
            // Force the grid to recalculate its layout
            this.gridApi.refreshCells();
          }
        }, 50);
        
        // Additional refresh after data is fully processed
        setTimeout(() => {
          if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
            this.gridApi.autoSizeAllColumns();
            this.gridApi.refreshCells();
          }
        }, 200);
      });
    }
  }

  ngAfterViewInit(): void {
    // Additional resize after view initialization
    if (this.isBrowser) {
      setTimeout(() => {
        this.resizeColumnsAfterDataLoad();
      }, 100);
      
      // Force a layout refresh after view is fully initialized
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 300);
      
      // Final attempt to ensure columns are properly sized
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
          // Force a complete grid refresh
          this.gridApi.refreshCells();
        }
      }, 600);
    }
  }

  private resizeColumnsAfterDataLoad(): void {
    if (this.gridApi) {
      // Use multiple timeouts to ensure the grid has fully rendered
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 50);
      
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 200);
      
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 500);
      
      // Additional resize after a longer delay to catch any late rendering
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 1000);
      
      // Force a final resize after all rendering is complete
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          // Also try to auto-size individual columns as a fallback
          this.gridApi.autoSizeAllColumns();
          // Force a complete grid refresh
          this.gridApi.refreshCells();
        }
      }, 1500);
    }
  }

  onSelectionChanged(event: any) {
    const selected = event.api.getSelectedRows() as any[];
    this.selectedIds = selected.map(r => r.id);
  }

  onGridReady(event: any) {
    // Store grid API for later use
    this.gridApi = event.api;
    
    // Initial resize
    this.gridApi.sizeColumnsToFit();
    
    // If data is already loaded, resize columns now
    if (this.rowData && this.rowData.length > 0) {
      this.resizeColumnsAfterDataLoad();
    }
    
    // Auto-resize columns when data changes
    this.gridApi.addEventListener('modelUpdated', () => {
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 100);
    });
    
    // Auto-resize columns on window resize
    window.addEventListener('resize', () => {
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
          this.gridApi.autoSizeAllColumns();
        }
      }, 100);
    });
  }



  create() {
    const ref = this.dialog.open(TemplateCreateDialogComponent, {
      panelClass: 'resizable-dialog',
      width: 'auto',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '95vh'
    });
    ref.afterClosed().subscribe(ok => { 
      if (ok) { 
        this.showNotification('🔄 Refreshing templates...', 'info');
        this.api.listTemplates().subscribe({
          next: (d) => {
            this.rowData = d;
            this.showNotification('✅ Template created successfully', 'success');
          },
          error: (error) => {
            const errorMessage = this.extractErrorMessage(error);
            this.showNotification(`❌ Failed to refresh templates: ${errorMessage}`, 'error');
          }
        });
      } 
    });
  }

  edit(row: any) {
    const ref = this.dialog.open(TemplateEditDialogComponent, {
      panelClass: 'resizable-dialog',
      width: 'auto',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '95vh',
    });
    ref.componentInstance.prefill(row);
    ref.afterClosed().subscribe(ok => { 
      if (ok) { 
        this.showNotification('🔄 Refreshing templates...', 'info');
        this.api.listTemplates().subscribe({
          next: (d) => {
            this.rowData = d;
            this.showNotification('✅ Template updated successfully', 'success');
          },
          error: (error) => {
            const errorMessage = this.extractErrorMessage(error);
            this.showNotification(`❌ Failed to refresh templates: ${errorMessage}`, 'error');
          }
        });
      } 
    });
  }

  editSelected() {
    if (this.selectedIds.length === 1) {
      const selectedRow = this.rowData.find(row => row.id === this.selectedIds[0]);
      if (selectedRow) {
        this.edit(selectedRow);
      }
    }
  }

  delete(templateId: string) {
    // TODO: Implement delete API call when backend supports it
    console.log('Delete template:', templateId);
    // For now, just remove from local data
    this.rowData = this.rowData.filter(t => t.id !== templateId);
  }

  suspendSelected() {
    if (!this.selectedIds.length) { return; }
    
    console.log('Suspending templates:', this.selectedIds);
    
    // Suspend each template and its instances
    const suspendPromises = this.selectedIds.map(templateId => {
      // First, get the current template data
      return this.api.getTemplate(templateId).pipe(
        // Update the template to set suspended = true
        switchMap(template => {
          // Transform TimerTemplate to CreateTemplateRequest format
          const updateRequest = {
            name: template.name,
            description: template.description,
            cronExpression: template.cronExpression,
            zoneId: template.zoneId,
            triggerTime: template.triggerTime,
            suspended: true,
            countries: template.countries || [],
            regions: template.regions || [],
            flowTypes: template.flowTypes || [],
            clientIds: template.clientIds || [],
            productTypes: template.productTypes || []
          };
          return this.api.updateTemplate(templateId, updateRequest);
        }),
        // After suspending template, find and suspend its instances
        switchMap(() => {
          // Find all instances for this template using pagination
          return this.fetchAllInstancesForTemplate(templateId).pipe(
            switchMap((instances: any[]) => {
              if (instances && Array.isArray(instances) && instances.length > 0) {
                const instanceIds = instances.map((instance: any) => instance.id);
                console.log(`Suspending ${instanceIds.length} instances for template ${templateId}`);
                return this.api.suspendInstances(instanceIds);
              }
              return of([]);
            })
          );
        })
      );
    });

    // Wait for all templates and instances to be suspended
    forkJoin(suspendPromises).subscribe({
      next: (results) => {
        console.log('All templates and instances suspended successfully');
        
        // Count total instances affected
        let totalInstances = 0;
        results.forEach(result => {
          if (Array.isArray(result)) {
            totalInstances += result.length;
          }
        });
        
        // Update local data
        this.rowData.forEach(template => {
          if (this.selectedIds.includes(template.id)) {
            template.suspended = true;
          }
        });
        this.rowData = [...this.rowData]; // Trigger change detection
        
        // Show detailed success message
        const templateCount = this.selectedIds.length;
        const message = `✅ ${templateCount} template(s) and ${totalInstances} instance(s) suspended successfully`;
        this.showNotification(message, 'success');
        
        this.selectedIds = [];
        
        // Refresh instances data to show updated status
        this.refreshInstancesData();
      },
      error: (error) => {
        console.error('Error suspending templates:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.showNotification(`❌ Failed to suspend templates: ${errorMessage}`, 'error');
        // Keep selection for retry
      }
    });
  }

  resumeSelected() {
    if (!this.selectedIds.length) { return; }
    
    console.log('Resuming templates:', this.selectedIds);
    
    // Resume each template and its instances
    const resumePromises = this.selectedIds.map(templateId => {
      // First, get the current template data
      return this.api.getTemplate(templateId).pipe(
        // Update the template to set suspended = false
        switchMap(template => {
          // Transform TimerTemplate to CreateTemplateRequest format
          const updateRequest = {
            name: template.name,
            description: template.description,
            cronExpression: template.cronExpression,
            zoneId: template.zoneId,
            triggerTime: template.triggerTime,
            suspended: false,
            countries: template.countries || [],
            regions: template.regions || [],
            flowTypes: template.flowTypes || [],
            clientIds: template.clientIds || [],
            productTypes: template.productTypes || []
          };
          return this.api.updateTemplate(templateId, updateRequest);
        }),
        // After resuming template, find and resume its instances
        switchMap(() => {
          // Find all instances for this template using pagination
          return this.fetchAllInstancesForTemplate(templateId).pipe(
            switchMap((instances: any[]) => {
              if (instances && Array.isArray(instances) && instances.length > 0) {
                const instanceIds = instances.map((instance: any) => instance.id);
                console.log(`Resuming ${instanceIds.length} instances for template ${templateId}`);
                return this.api.resumeInstances(instanceIds);
              }
              return of([]);
            })
          );
        })
      );
    });

    // Wait for all templates and instances to be resumed
    forkJoin(resumePromises).subscribe({
      next: (results) => {
        console.log('All templates and instances resumed successfully');
        
        // Count total instances affected
        let totalInstances = 0;
        results.forEach(result => {
          if (Array.isArray(result)) {
            totalInstances += result.length;
          }
        });
        
        // Update local data
        this.rowData.forEach(template => {
          if (this.selectedIds.includes(template.id)) {
            template.suspended = false;
          }
        });
        this.rowData = [...this.rowData]; // Trigger change detection
        
        // Show detailed success message
        const templateCount = this.selectedIds.length;
        const message = `✅ ${templateCount} template(s) and ${totalInstances} instance(s) resumed successfully`;
        this.showNotification(message, 'success');
        
        this.selectedIds = [];
        
        // Refresh instances data to show updated status
        this.refreshInstancesData();
      },
      error: (error) => {
        console.error('Error resuming templates:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.showNotification(`❌ Failed to resume templates: ${errorMessage}`, 'error');
        // Keep selection for retry
      }
    });
  }

  deleteSelected() {
    if (!this.selectedIds.length) { return; }
    
    const templateCount = this.selectedIds.length;
    const templateNames = this.rowData
      .filter(t => this.selectedIds.includes(t.id))
      .map(t => t.name)
      .join(', ');
    
    // Build a more detailed confirmation message
    const selectedTemplates = this.rowData.filter(t => this.selectedIds.includes(t.id));
    let confirmationMessage = `Are you sure you want to delete ${templateCount} template(s)?\n\n`;
    
    selectedTemplates.forEach(template => {
      confirmationMessage += `• ${template.name} (${template.id})\n`;
      if (template.countries && template.countries.length > 0) {
        confirmationMessage += `  Countries: ${template.countries.join(', ')}\n`;
      }
      if (template.regions && template.regions.length > 0) {
        confirmationMessage += `  Regions: ${template.regions.join(', ')}\n`;
      }
      confirmationMessage += '\n';
    });
    
    confirmationMessage += '⚠️ WARNING: This will also delete all associated timer instances!\n\n';
    confirmationMessage += 'Are you sure you want to continue?';
    
    if (confirm(confirmationMessage)) {
      console.log('Deleting templates:', this.selectedIds);
      
      // Show info notification
      this.showNotification(`🗑️ Deleting ${templateCount} template(s): ${templateNames}`, 'info');
      
      // Try to delete each template via API, with fallback to local deletion
      const deletePromises = this.selectedIds.map(templateId => {
        return this.api.deleteTemplate(templateId).pipe(
          // If API call succeeds, return success
          switchMap(() => {
            console.log(`Template ${templateId} deleted via API`);
            return of({ success: true, templateId });
          }),
          // If API call fails, fall back to local deletion
          catchError((error) => {
            console.warn(`API delete failed for template ${templateId}, falling back to local deletion:`, error);
            return of({ success: false, templateId, error });
          })
        );
      });
      
      // Wait for all delete operations to complete
      forkJoin(deletePromises).subscribe({
        next: (results) => {
          const successfulDeletes = results.filter(r => r.success);
          const failedDeletes = results.filter(r => !r.success);
          
          // Remove deleted templates from local data
          this.rowData = this.rowData.filter(template => !this.selectedIds.includes(template.id));
          this.selectedIds = [];
          
          // Show appropriate notification
          if (failedDeletes.length === 0) {
            // All deletes succeeded via API
            this.showNotification(`✅ Successfully deleted ${templateCount} template(s) via backend`, 'success');
          } else if (successfulDeletes.length === 0) {
            // All deletes failed, but we did local deletion
            this.showNotification(`⚠️ Backend delete not available, removed ${templateCount} template(s) locally only`, 'info');
          } else {
            // Mixed results
            this.showNotification(`⚠️ Partially successful: ${successfulDeletes.length} deleted via backend, ${failedDeletes.length} removed locally`, 'info');
          }
          
          // Refresh instances data to show updated status
          this.refreshInstancesData();
        },
        error: (error) => {
          console.error('Error during delete operation:', error);
          const errorMessage = this.extractErrorMessage(error);
          this.showNotification(`❌ Failed to delete templates: ${errorMessage}`, 'error');
          
          // Even if API fails, we can still do local deletion as fallback
          if (confirm('Backend delete failed. Would you like to remove the templates locally anyway?')) {
            this.rowData = this.rowData.filter(template => !this.selectedIds.includes(template.id));
            this.selectedIds = [];
            this.showNotification(`⚠️ Removed ${templateCount} template(s) locally only`, 'info');
            this.refreshInstancesData();
          }
        }
      });
    }
  }

  // column toggles removed

  private formatListForDisplay(items: string[]): string {
    if (!items || items.length === 0) return '<span style="color: #9e9e9e; font-style: italic;">—</span>';
    if (items.length <= 3) return items.join(', ');
    return `${items.slice(0, 2).join(', ')} <span style="color: #1976d2; font-weight: 500;">+${items.length - 2} more</span>`;
  }

  private createListCellRenderer(displayValue: string, fullList: string[]): string {
    if (!fullList || fullList.length === 0) return displayValue; // Return the placeholder
    if (fullList.length <= 3) return displayValue;
    
    const fullText = fullList.join(', ');
    return `<span title="${fullText}" style="cursor: help;">${displayValue}</span>`;
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info') {
    const panelClass = type === 'success' ? 'success-snackbar' : 
                      type === 'error' ? 'error-snackbar' : 'info-snackbar';
    
    this.snackBar.open(message, 'Close', { 
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [panelClass],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status) {
      return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }

  private refreshInstancesData() {
    // This method can be used to refresh instances data in other components
    // For now, we'll just log that instances should be refreshed
    console.log('Instances data should be refreshed to show updated status');
    
    // TODO: Implement event bus or service to notify other components to refresh
    // this.eventBus.emit('instances-refresh');
  }

  /**
   * Fetches all instances for a template using pagination to respect backend limits
   */
  private fetchAllInstancesForTemplate(templateId: string): Observable<any[]> {
    return new Observable((observer: Observer<any[]>) => {
      const allInstances: any[] = [];
      let page = 0;
      const pageSize = TemplatesComponent.INSTANCE_PAGE_SIZE;
      
      const fetchPage = () => {
        this.api.listInstances({ templateId, page, size: pageSize }).subscribe({
          next: (instances) => {
            if (instances && Array.isArray(instances) && instances.length > 0) {
              allInstances.push(...instances);
              
              // If we got a full page, there might be more
              if (instances.length === pageSize) {
                page++;
                // Show pagination progress for large datasets
                if (allInstances.length > pageSize) {
                  this.showNotification(`📄 Fetching instances... (${allInstances.length} so far)`, 'info');
                }
                fetchPage(); // Fetch next page
              } else {
                // Last page, complete
                if (allInstances.length > pageSize) {
                  this.showNotification(`✅ Found ${allInstances.length} total instances`, 'info');
                }
                observer.next(allInstances);
                observer.complete();
              }
            } else {
              // No instances found
              observer.next(allInstances);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      };
      
      fetchPage();
    });
  }

  /**
   * Check if the delete endpoint is available
   */
  private checkDeleteEndpointAvailability(): Observable<boolean> {
    // For now, we'll assume it's not available since it's not in the OpenAPI spec
    // In a real implementation, you could make a HEAD request to test
    return new Observable(observer => {
      observer.next(false);
      observer.complete();
    });
  }

}
