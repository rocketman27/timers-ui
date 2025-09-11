import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ApiService} from '../../../core/api.service';

@Component({
  selector: 'app-timer-create-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatStepperModule, MatAutocompleteModule, MatSelectModule, MatButtonToggleModule],
  templateUrl: './timer-create-dialog.component.html',
  styleUrls: ['./timer-create-dialog.component.scss']
})
export class TimerCreateDialogComponent implements OnInit {
  isSubmitting = false;
  selectedIndex = 0;
  scopeMode: 'countries' | 'regions' = 'countries';
  basicForm!: FormGroup;
  geoForm!: FormGroup;
  businessForm!: FormGroup;
  filteredTimeZones: { label: string; value: string }[] = [];
  regions: { name: string }[] = [];
  filteredCountries: { countryCode: string }[] = [];

  constructor(
    private ref: MatDialogRef<TimerCreateDialogComponent>,
    private api: ApiService,
    private snack: MatSnackBar,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.basicForm = this.fb.group({
      name: ['', Validators.required],
      zoneId: ['UTC', Validators.required],
      triggerTime: ['10:15'],
      suspended: [false]
    });
    this.geoForm = this.fb.group({
      regions: [[] as string[]],
      countries: [[] as string[]],
      excludedCountries: [[] as string[]]
    });
    this.businessForm = this.fb.group({flowTypes: [''], clientIds: [''], productTypes: [[] as string[]]});
    try {
      // @ts-ignore
      const tz = typeof Intl !== 'undefined' && Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'];
      this.filteredTimeZones = (tz as string[]).slice(0, 400).map(z => ({label: z, value: z}));
    } catch {
      this.filteredTimeZones = [{label: 'UTC', value: 'UTC'}];
    }
    this.api.listRegions().subscribe(r => {
      this.regions = (r || []).map((x: any) => ({name: x.name || x}));
    });
    this.api.listCountries().subscribe(c => {
      this.filteredCountries = (c || []).map((x: any) => ({countryCode: x.countryCode || x}));
    });
  }

  isFormValid(): boolean {
    return this.basicForm.valid;
  }

  submit() {
    if (this.isSubmitting || !this.isFormValid()) return;
    this.isSubmitting = true;
    const body = {
      name: this.basicForm.value.name,
      description: '',
      cronExpression: '',
      zoneId: this.basicForm.value.zoneId,
      triggerTime: this.basicForm.value.triggerTime,
      suspended: !!this.basicForm.value.suspended,
      countries: this.scopeMode === 'countries' ? (this.geoForm.value.countries || []) : [],
      regions: this.scopeMode === 'regions' ? (this.geoForm.value.regions || []) : [],
      excludedCountries: this.scopeMode === 'regions' ? (this.geoForm.value.excludedCountries || []) : [],
      excludedRegions: [],
      flowTypes: (this.businessForm.value.flowTypes || '').split(',').map((s: string) => s.trim()).filter((s: string) => !!s),
      clientIds: (this.businessForm.value.clientIds || '').split(',').map((s: string) => s.trim()).filter((s: string) => !!s),
      productTypes: Array.isArray(this.businessForm.value.productTypes)
        ? (this.businessForm.value.productTypes as string[])
        : String(this.businessForm.value.productTypes || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s),
    };
    this.api.createTimer(body).subscribe({
      next: () => {
        this.snack.open('Timer created', 'Close', {duration: 2000});
        this.ref.close(true);
      }, error: () => this.snack.open('Failed to create Timer', 'Close', {duration: 3000})
    }).add(() => this.isSubmitting = false);
  }

  cancel() {
    this.ref.close(false);
  }

  filterTimeZones(event: any) {
    const q = (event?.target?.value || '').toLowerCase();
    try { // @ts-ignore
      const tz: string[] = typeof Intl !== 'undefined' && Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'];
      this.filteredTimeZones = tz.filter(z => z.toLowerCase().includes(q)).slice(0, 400).map(z => ({
        label: z,
        value: z
      }));
    } catch {
    }
  }

  getTimeZoneDisplayName(v: string) {
    return v;
  }

  onTimeZoneSelected(_: any) {
  }

  getTimeZoneOffset(tz: string) {
    try {
      const dt = new Date();
      const optsOffset: any = {timeZone: tz, timeZoneName: 'shortOffset', year: 'numeric'};
      let parts = new Intl.DateTimeFormat('en-US', optsOffset).formatToParts(dt);
      let raw = parts.find(p => p.type === 'timeZoneName')?.value || '';
      if (!raw || /^(GMT|UTC)$/i.test(raw)) {
        const optsShort: any = {timeZone: tz, timeZoneName: 'short', year: 'numeric'};
        parts = new Intl.DateTimeFormat('en-US', optsShort).formatToParts(dt);
        raw = parts.find(p => p.type === 'timeZoneName')?.value || '';
      }
      const m = raw.match(/([GU]MT|UTC)?([+\-−]\d{1,2})(?::?(\d{2}))?/);
      if (!m) return '(UTC+00:00)';
      const sign = m[2].startsWith('-') || m[2].startsWith('−') ? '-' : '+';
      const h = Math.abs(parseInt(m[2].replace('−', '-'), 10));
      const mm = m[3] ? parseInt(m[3], 10) : 0;
      const hh = (h < 10 ? '0' : '') + h;
      const mmStr = (mm < 10 ? '0' : '') + mm;
      return `(UTC${sign}${hh}:${mmStr})`;
    } catch {
      return '(UTC+00:00)';
    }
  }

  onScopeModeChange(val: 'countries' | 'regions') {
    this.scopeMode = val;
  }

  selectAllRegions() {
    this.geoForm.patchValue({regions: this.regions.map(r => r.name)});
  }

  clearRegions() {
    this.geoForm.patchValue({regions: []});
  }

  onRegionsChange() {
    const rs: string[] = this.geoForm.value.regions || [];
    if (rs.length) {
      this.api.listCountries({region: rs[0]}).subscribe(c => {
        this.filteredCountries = (c || []).map((x: any) => ({countryCode: x.countryCode || x}));
      });
    }
  }

  selectAllCountries() {
    this.geoForm.patchValue({countries: this.filteredCountries.map(c => c.countryCode)});
  }

  clearCountries() {
    this.geoForm.patchValue({countries: []});
  }

  clearExcludedCountries() {
    this.geoForm.patchValue({excludedCountries: []});
  }
}


