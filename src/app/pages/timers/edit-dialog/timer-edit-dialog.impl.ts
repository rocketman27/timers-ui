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
      countries: Array.isArray(this.model.countries) ? this.model.countries : [],
      regions: Array.isArray(this.model.regions) ? this.model.regions : [],
      excludedCountries: Array.isArray(this.model.excludedCountries) ? this.model.excludedCountries : [],
      excludedRegions: Array.isArray(this.model.excludedRegions) ? this.model.excludedRegions : [],
      flowTypes: Array.isArray(this.model.flowTypes)
        ? this.model.flowTypes
        : String(this.model.flowTypes || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s),
      clientIds: Array.isArray(this.model.clientIds)
        ? this.model.clientIds
        : String(this.model.clientIds || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s),
      productTypes: Array.isArray(this.model.productTypes)
        ? this.model.productTypes
        : String(this.model.productTypes || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s)
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

  onTimeZoneSelected(e: any) {
    const v = e?.option?.value;
    if (v) {
      this.model.zoneId = v;
    }
  }

  getTimeZoneOffset(tz: string) {
    try {
      const now = new Date();

      const offsetStr = this.readTimeZoneName(now, tz, 'shortOffset');
      const parsedFromOffset = this.parseOffset(offsetStr);
      if (parsedFromOffset) return parsedFromOffset;

      const shortStr = this.readTimeZoneName(now, tz, 'short');
      const parsedFromShort = this.parseOffset(shortStr);
      return parsedFromShort ?? '(UTC+00:00)';
    } catch {
      return '(UTC+00:00)';
    }
  }

  private readTimeZoneName(date: Date, tz: string, mode: 'shortOffset' | 'short'): string {
    const opts: any = { timeZone: tz, timeZoneName: mode, year: 'numeric' };
    const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date);
    return parts.find(p => p.type === 'timeZoneName')?.value || '';
  }

  private parseOffset(label: string): string | null {
    if (!label || /^(GMT|UTC)$/i.test(label)) return null;
    const m = label.match(/([GU]MT|UTC)?([+\-−]\d{1,2})(?::?(\d{2}))?/);
    if (!m) return null;
    const sign = m[2].startsWith('-') || m[2].startsWith('−') ? '-' : '+';
    const hours = Math.abs(parseInt(m[2].replace('−', '-'), 10));
    const minutes = m[3] ? parseInt(m[3], 10) : 0;
    const hh = hours < 10 ? `0${hours}` : String(hours);
    const mm = minutes < 10 ? `0${minutes}` : String(minutes);
    return `(UTC${sign}${hh}:${mm})`;
  }
}


