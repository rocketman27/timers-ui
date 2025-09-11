import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-template-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatAutocompleteModule, MatSelectModule, MatStepperModule],
  templateUrl: './template-create-dialog.component.html',
  styleUrl: './template-create-dialog.component.scss'
})
export class TemplateCreateDialogComponent implements OnInit {
  basicForm: FormGroup;
  geoForm: FormGroup;
  businessForm: FormGroup;
  selectedIndex = 0;

  isSubmitting = false;

  regions: any[] = [];
  countries: any[] = [];
  
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

  constructor(
    private api: ApiService, 
    private ref: MatDialogRef<TemplateCreateDialogComponent>,
    private fb: FormBuilder
  ) {
    this.basicForm = this.fb.group({
      name: ['', Validators.required],
      zoneId: ['UTC', Validators.required],
      triggerTime: ['10:15', Validators.required],
      suspended: [false]
    });

    this.geoForm = this.fb.group({
      regions: [[]],
      countries: [[]],
      excludedCountries: [[]],
      excludedRegions: [[]]
    });

    this.businessForm = this.fb.group({
      flowTypes: [''],
      clientIds: [''],
      productTypes: [[]]
    });
  }

  private parseList(value: string): string[] {
    return (value || '')
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }

  ngOnInit(): void {
    this.api.listRegions().subscribe(r => this.regions = r || []);
    this.api.listCountries().subscribe(r => this.countries = r || []);
    this.filteredTimeZones = [...this.timeZones];
  }

  get filteredCountries(): any[] {
    const regions = this.geoForm.get('regions')?.value || [];
    const regionsFilter = (c: any) => !regions?.length || regions.includes(c.region);
    return (this.countries || []).filter((c: any) => regionsFilter(c));
  }

  onRegionsChange(): void {
    const countryCodes = new Set(this.filteredCountries.map((c: any) => c.countryCode));
    const currentCountries = this.geoForm.get('countries')?.value || [];
    this.geoForm.patchValue({
      countries: currentCountries.filter((code: string) => countryCodes.has(code))
    });
  }

  // Selection helper methods
  selectAllRegions(): void {
    const allRegionNames = this.regions.map(r => r.name);
    this.geoForm.patchValue({ regions: allRegionNames });
    this.onRegionsChange();
  }

  clearRegions(): void {
    this.geoForm.patchValue({ regions: [] });
    this.onRegionsChange();
  }



  selectAllCountries(): void {
    const allCountryCodes = this.filteredCountries.map(c => c.countryCode);
    this.geoForm.patchValue({ countries: allCountryCodes });
  }

  clearCountries(): void {
    this.geoForm.patchValue({ countries: [] });
  }

  clearExcludedCountries() {
    this.geoForm.patchValue({ excludedCountries: [] });
  }

  clearExcludedRegions() {
    this.geoForm.patchValue({ excludedRegions: [] });
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
    // The form control is automatically updated, but we can add custom logic here if needed
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

  isFormValid(): boolean {
    return this.basicForm.valid && this.geoForm.valid && this.businessForm.valid;
  }

  submit() {
    if (!this.isFormValid()) {
      return;
    }
    this.isSubmitting = true;
    
    const basicValues = this.basicForm.value;
    const geoValues = this.geoForm.value;
    const businessValues = this.businessForm.value;
    
    const body = {
      name: basicValues.name?.trim(),
      zoneId: basicValues.zoneId?.trim() || 'UTC',
      triggerTime: basicValues.triggerTime?.trim() || '10:15',
      suspended: !!basicValues.suspended,
      countries: geoValues.countries || [],
      regions: geoValues.regions || [],
      excludedCountries: geoValues.excludedCountries || [],
      excludedRegions: geoValues.excludedRegions || [],
      
      flowTypes: this.parseList(businessValues.flowTypes),
      clientIds: this.parseList(businessValues.clientIds),
      productTypes: businessValues.productTypes || []
    };
    
    this.api.createTemplate(body).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.ref.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.ref.close(false);
  }
}



