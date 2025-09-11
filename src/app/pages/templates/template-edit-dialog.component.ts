import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-template-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './template-edit-dialog.component.html',
  styleUrl: './template-edit-dialog.component.scss'
})
export class TemplateEditDialogComponent implements OnInit {
  model: any = {
    id: '',
    name: '',
    zoneId: 'UTC',
    triggerTime: '10:15',
    countries: '',
    regions: '',
    excludedCountries: '',
    excludedRegions: '',
    flowTypes: '',
    clientIds: '',
    productTypes: ''
  };

  isSubmitting = false;
  
  timeZones: { value: string; label: string }[] = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
    { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
    { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT) - Anchorage' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST) - Honolulu' },
    { value: 'Europe/London', label: 'British Time (GMT/BST) - London' },
    { value: 'Europe/Paris', label: 'Central European Time (CET/CEST) - Paris' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET/CEST) - Berlin' },
    { value: 'Europe/Rome', label: 'Central European Time (CET/CEST) - Rome' },
    { value: 'Europe/Madrid', label: 'Central European Time (CET/CEST) - Madrid' },
    { value: 'Europe/Amsterdam', label: 'Central European Time (CET/CEST) - Amsterdam' },
    { value: 'Europe/Zurich', label: 'Central European Time (CET/CEST) - Zurich' },
    { value: 'Europe/Stockholm', label: 'Central European Time (CET/CEST) - Stockholm' },
    { value: 'Europe/Oslo', label: 'Central European Time (CET/CEST) - Oslo' },
    { value: 'Europe/Copenhagen', label: 'Central European Time (CET/CEST) - Copenhagen' },
    { value: 'Europe/Helsinki', label: 'Eastern European Time (EET/EEST) - Helsinki' },
    { value: 'Europe/Athens', label: 'Eastern European Time (EET/EEST) - Athens' },
    { value: 'Europe/Prague', label: 'Central European Time (CET/CEST) - Prague' },
    { value: 'Europe/Vienna', label: 'Central European Time (CET/CEST) - Vienna' },
    { value: 'Europe/Budapest', label: 'Central European Time (CET/CEST) - Budapest' },
    { value: 'Europe/Warsaw', label: 'Central European Time (CET/CEST) - Warsaw' },
    { value: 'Europe/Moscow', label: 'Moscow Time (MSK) - Moscow' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST) - Shanghai' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT) - Hong Kong' },
    { value: 'Asia/Singapore', label: 'Singapore Time (SGT) - Singapore' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (KST) - Seoul' },
    { value: 'Asia/Bangkok', label: 'Indochina Time (ICT) - Bangkok' },
    { value: 'Asia/Jakarta', label: 'Western Indonesian Time (WIB) - Jakarta' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Mumbai' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
    { value: 'Asia/Tehran', label: 'Iran Standard Time (IRST) - Tehran' },
    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT) - Karachi' },
    { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST) - Dhaka' },
    { value: 'Asia/Manila', label: 'Philippine Time (PHT) - Manila' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Indochina Time (ICT) - Ho Chi Minh City' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST/AEDT) - Sydney' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AEST/AEDT) - Melbourne' },
    { value: 'Australia/Brisbane', label: 'Australian Eastern Time (AEST) - Brisbane' },
    { value: 'Australia/Perth', label: 'Australian Western Time (AWST) - Perth' },
    { value: 'Australia/Adelaide', label: 'Australian Central Time (ACST/ACDT) - Adelaide' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST/NZDT) - Auckland' },
    { value: 'Pacific/Fiji', label: 'Fiji Time (FJT) - Suva' },
    { value: 'America/Sao_Paulo', label: 'Brasilia Time (BRT/BRST) - São Paulo' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (ART) - Buenos Aires' },
    { value: 'America/Santiago', label: 'Chile Time (CLT/CLST) - Santiago' },
    { value: 'America/Lima', label: 'Peru Time (PET) - Lima' },
    { value: 'America/Mexico_City', label: 'Central Time (CT) - Mexico City' },
    { value: 'America/Toronto', label: 'Eastern Time (ET) - Toronto' },
    { value: 'America/Vancouver', label: 'Pacific Time (PT) - Vancouver' },
    { value: 'Africa/Cairo', label: 'Eastern European Time (EET/EEST) - Cairo' },
    { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST) - Johannesburg' },
    { value: 'Africa/Lagos', label: 'West Africa Time (WAT) - Lagos' },
    { value: 'Africa/Nairobi', label: 'East Africa Time (EAT) - Nairobi' },
    { value: 'Africa/Casablanca', label: 'Western European Time (WET/WEST) - Casablanca' }
  ];
  
  filteredTimeZones: { value: string; label: string }[] = [];

  regions: any[] = [];
  countries: any[] = [];

  constructor(
    private api: ApiService,
    private ref: MatDialogRef<TemplateEditDialogComponent>,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.filteredTimeZones = [...this.timeZones];
    
    // Load geographic data
    this.api.listRegions().subscribe(r => this.regions = r || []);
    this.api.listCountries().subscribe(r => this.countries = r || []);
  }

  get filteredCountries(): any[] {
    const regions = this.model.regions || [];
    const regionsFilter = (c: any) => !regions?.length || regions.includes(c.region);
    return (this.countries || []).filter((c: any) => regionsFilter(c));
  }

  // Selection helper methods
  selectAllRegions(): void {
    const allRegionNames = this.regions.map(r => r.name);
    this.model.regions = allRegionNames;
  }

  clearRegions(): void {
    this.model.regions = [];
  }



  selectAllCountries(): void {
    const allCountryCodes = this.filteredCountries.map(c => c.countryCode);
    this.model.countries = allCountryCodes;
  }

  clearCountries(): void {
    this.model.countries = [];
  }

  clearExcludedCountries() {
    this.model.excludedCountries = '';
  }

  clearExcludedRegions() {
    this.model.excludedRegions = '';
  }

  filterTimeZones(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredTimeZones = [...this.timeZones];
    } else {
      this.filteredTimeZones = this.timeZones.filter(tz => 
        tz.label.toLowerCase().includes(searchTerm) || 
        tz.value.toLowerCase().includes(searchTerm)
      );
    }
  }

  onTimeZoneSelected(event: any): void {
    // The ngModel is automatically updated, but we can add custom logic here if needed
    console.log('Selected time zone:', event.option.value);
  }

  getTimeZoneDisplayName(zoneId: string): string {
    const timeZone = this.timeZones.find(tz => tz.value === zoneId);
    if (timeZone) {
      return `${timeZone.label} - ${this.getTimeZoneOffset(zoneId)}`;
    }
    return zoneId;
  }

  getTimeZoneOffset(zoneId: string): string {
    // Use a comprehensive mapping of time zones to their standard abbreviations
    const timeZoneMap: { [key: string]: string } = {
      'UTC': 'UTC+0',
      'America/New_York': 'EST/EDT (UTC-5/-4)',
      'America/Chicago': 'CST/CDT (UTC-6/-5)',
      'America/Denver': 'MST/MDT (UTC-7/-6)',
      'America/Los_Angeles': 'PST/PDT (UTC-8/-7)',
      'America/Anchorage': 'AKST/AKDT (UTC-9/-8)',
      'Pacific/Honolulu': 'HST (UTC-10)',
      'Europe/London': 'GMT/BST (UTC+0/+1)',
      'Europe/Paris': 'CET/CEST (UTC+1/+2)',
      'Europe/Berlin': 'CET/CEST (UTC+1/+2)',
      'Europe/Rome': 'CET/CEST (UTC+1/+2)',
      'Europe/Madrid': 'CET/CEST (UTC+1/+2)',
      'Europe/Amsterdam': 'CET/CEST (UTC+1/+2)',
      'Europe/Zurich': 'CET/CEST (UTC+1/+2)',
      'Europe/Stockholm': 'CET/CEST (UTC+1/+2)',
      'Europe/Oslo': 'CET/CEST (UTC+1/+2)',
      'Europe/Copenhagen': 'CET/CEST (UTC+1/+2)',
      'Europe/Helsinki': 'EET/EEST (UTC+2/+3)',
      'Europe/Athens': 'EET/EEST (UTC+2/+3)',
      'Europe/Prague': 'CET/CEST (UTC+1/+2)',
      'Europe/Vienna': 'CET/CEST (UTC+1/+2)',
      'Europe/Budapest': 'CET/CEST (UTC+1/+2)',
      'Europe/Warsaw': 'CET/CEST (UTC+1/+2)',
      'Europe/Moscow': 'MSK (UTC+3)',
      'Asia/Tokyo': 'JST (UTC+9)',
      'Asia/Shanghai': 'CST (UTC+8)',
      'Asia/Hong_Kong': 'HKT (UTC+8)',
      'Asia/Singapore': 'SGT (UTC+8)',
      'Asia/Seoul': 'KST (UTC+9)',
      'Asia/Bangkok': 'ICT (UTC+7)',
      'Asia/Jakarta': 'WIB (UTC+7)',
      'Asia/Kolkata': 'IST (UTC+5:30)',
      'Asia/Dubai': 'GST (UTC+4)',
      'Asia/Tehran': 'IRST (UTC+3:30)',
      'Asia/Karachi': 'PKT (UTC+5)',
      'Asia/Dhaka': 'BST (UTC+6)',
      'Asia/Manila': 'PHT (UTC+8)',
      'Asia/Ho_Chi_Minh': 'ICT (UTC+7)',
      'Australia/Sydney': 'AEST/AEDT (UTC+10/+11)',
      'Australia/Melbourne': 'AEST/AEDT (UTC+10/+11)',
      'Australia/Brisbane': 'AEST (UTC+10)',
      'Australia/Perth': 'AWST (UTC+8)',
      'Australia/Adelaide': 'ACST/ACDT (UTC+9:30/+10:30)',
      'Pacific/Auckland': 'NZST/NZDT (UTC+12/+13)',
      'Pacific/Fiji': 'FJT (UTC+12)',
      'America/Sao_Paulo': 'BRT/BRST (UTC-3/-2)',
      'America/Argentina/Buenos_Aires': 'ART (UTC-3)',
      'America/Santiago': 'CLT/CLST (UTC-3/-2)',
      'America/Lima': 'PET (UTC-5)',
      'America/Mexico_City': 'CST/CDT (UTC-6/-5)',
      'America/Toronto': 'EST/EDT (UTC-5/-4)',
      'America/Vancouver': 'PST/PDT (UTC-8/-7)',
      'Africa/Cairo': 'EET/EEST (UTC+2/+3)',
      'Africa/Johannesburg': 'SAST (UTC+2)',
      'Africa/Lagos': 'WAT (UTC+1)',
      'Africa/Nairobi': 'EAT (UTC+3)',
      'Africa/Casablanca': 'WET/WEST (UTC+0/+1)'
    };
    
    return timeZoneMap[zoneId] || zoneId.split('/').pop() || zoneId;
  }

  prefill(data: any) {
    if (!data) { return; }
    this.model.id = data.id;
    this.model.name = data.name || '';
    this.model.zoneId = data.zoneId || 'UTC';
    this.model.triggerTime = data.triggerTime || '10:15';
    this.model.countries = data.countries || [];
    this.model.regions = data.regions || [];
    this.model.excludedCountries = (data.excludedCountries || []).join(', ');
    this.model.excludedRegions = (data.excludedRegions || []).join(', ');

    this.model.flowTypes = (data.flowTypes || []).join(', ');
    this.model.clientIds = (data.clientIds || []).join(', ');
    this.model.productTypes = (data.productTypes || []).join(', ');
  }

  parseList(value: string): string[] {
    return (value || '')
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }

  submit() {
    if (!this.model.name?.trim() || !this.model.id) {
      return;
    }
    this.isSubmitting = true;
    const body = {
      name: this.model.name?.trim(),
      zoneId: this.model.zoneId?.trim() || 'UTC',
      triggerTime: this.model.triggerTime?.trim() || '10:15',
      countries: this.model.countries || [],
      regions: this.model.regions || [],
      excludedCountries: this.parseList(this.model.excludedCountries),
      excludedRegions: this.parseList(this.model.excludedRegions),
      
      flowTypes: this.parseList(this.model.flowTypes),
      clientIds: this.parseList(this.model.clientIds),
      productTypes: this.parseList(this.model.productTypes)
    };
    this.api.updateTemplate(this.model.id, body).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snack.open('Template saved', 'Close', { duration: 2000 });
        this.ref.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Failed to save template';
        this.snack.open(msg, 'Close', { duration: 3000 });
        // keep dialog open for corrections
      }
    });
  }

  cancel() {
    this.ref.close(false);
  }
}


