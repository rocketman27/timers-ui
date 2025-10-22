import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // Timers
  listTimers(): Observable<any[]> { return this.http.get<any[]>('/api/timers'); }
  createTimer(body: any): Observable<any> { return this.http.post<any>('/api/timers', body); }
  getTimer(id: string): Observable<any> { return this.http.get<any>(`/api/timers/${id}`); }
  updateTimer(id: string, body: any): Observable<any> { return this.http.put<any>(`/api/timers/${id}`, body); }
  deleteTimer(id: string): Observable<any> { return this.http.delete<any>(`/api/timers/${id}`); }

  // Executions
  listExecutions(params: any): Observable<any[]> { return this.http.get<any[]>('/api/executions', { params }); }

  // Timers - manual trigger
  triggerTimer(id: string): Observable<void> { return this.http.post<void>(`/api/timers/${id}/_trigger`, {}); }
  triggerTimers(ids: string[]): Observable<void> { return this.http.post<void>('/api/timers/_trigger', { ids }); }

  // Geo catalogs
  listRegions(): Observable<any[]> { return this.http.get<any[]>('/api/geo/regions'); }
  listCountries(filters?: { region?: string }): Observable<any[]> {
    const params: any = {};
    if (filters?.region) params.region = filters.region;
    return this.http.get<any[]>('/api/geo/countries', { params });
  }
}
