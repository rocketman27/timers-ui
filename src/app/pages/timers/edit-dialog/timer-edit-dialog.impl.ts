import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ApiService} from '../../../core/api.service';

@Component({
  selector: 'app-timer-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatSelectModule, MatButtonToggleModule, MatAutocompleteModule],
  templateUrl: './timer-edit-dialog.component.html',
  styleUrls: ['./timer-edit-dialog.component.scss']
})
export class TimerEditDialogComponent implements OnInit {
  model: any = {};
  isSubmitting = false;
  scopeMode: 'countries' | 'regions' = 'countries';
  regions: { name: string }[] = [];
  filteredCountries: { countryCode: string }[] = [];
  filteredTimeZones: { label: string; value: string }[] = [];

  constructor(
    private ref: MatDialogRef<TimerEditDialogComponent>,
    private api: ApiService,
    private snack: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.api.listRegions().subscribe(r => {
      this.regions = (r || []).map((x: any) => ({name: x.name || x}));
    });
    this.api.listCountries().subscribe(c => {
      this.filteredCountries = (c || []).map((x: any) => ({countryCode: x.countryCode || x}));
    });
    try {
      // @ts-ignore
      const tz = typeof Intl !== 'undefined' && Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'];
      this.filteredTimeZones = (tz as string[]).slice(0, 400).map(z => ({label: z, value: z}));
    } catch {
      this.filteredTimeZones = [{label: 'UTC', value: 'UTC'}];
    }
  }

  prefill(row: any) {
    this.model = {...row};
  }

  submit() {
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const body = {
      name: this.model.name,
      description: this.model.description,
      cronExpression: this.model.cronExpression,
      zoneId: this.model.zoneId,
      triggerTime: this.model.triggerTime,
      suspended: !!this.model.suspended,
      countries: this.model.countries,
      regions: this.model.regions,
      excludedCountries: this.model.excludedCountries,
      excludedRegions: this.model.excludedRegions,
      flowTypes: this.model.flowTypes,
      clientIds: this.model.clientIds,
      productTypes: this.model.productTypes
    };
    this.api.updateTimer(this.model.id, body).subscribe({
      next: () => {
        this.snack.open('Timer saved', 'Close', {duration: 2000});
        this.ref.close(true);
      }, error: () => this.snack.open('Failed to save Timer', 'Close', {duration: 3000})
    }).add(() => this.isSubmitting = false);
  }

  cancel() {
    this.ref.close(false);
  }

  onScopeModeChange(val: 'countries' | 'regions') {
    this.scopeMode = val;
  }

  selectAllRegions() {
    this.model.regions = this.regions.map(r => r.name);
  }

  clearRegions() {
    this.model.regions = [];
  }

  onRegionsChange() {
    const rs: string[] = this.model.regions || [];
    if (rs.length) {
      this.api.listCountries({region: rs[0]}).subscribe(c => {
        this.filteredCountries = (c || []).map((x: any) => ({countryCode: x.countryCode || x}));
      });
    }
  }

  selectAllCountries() {
    this.model.countries = this.filteredCountries.map(c => c.countryCode);
  }

  clearCountries() {
    this.model.countries = [];
  }

  clearExcludedCountries() {
    this.model.excludedCountries = [];
  }

  onCountriesChange() {
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

  onTimeZoneSelected(e: any) {
    const v = e?.option?.value;
    if (v) {
      this.model.zoneId = v;
    }
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
}


