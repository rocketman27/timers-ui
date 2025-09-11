import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // Templates
  listTemplates(): Observable<any[]> { return this.http.get<any[]>('/api/templates'); }
  createTemplate(body: any): Observable<any> { return this.http.post<any>('/api/templates', body); }
  getTemplate(id: string): Observable<any> { return this.http.get<any>(`/api/templates/${id}`); }
  updateTemplate(id: string, body: any): Observable<any> { return this.http.put<any>(`/api/templates/${id}`, body); }
  deleteTemplate(id: string): Observable<any> { return this.http.delete<any>(`/api/templates/${id}`); }


  // Instances
  listInstances(params: any): Observable<any[]> { return this.http.get<any[]>('/api/instances', { params }); }
  suspendInstances(ids: string[]): Observable<any[]> { return this.http.post<any[]>('/api/instances/_suspend', { ids }); }
  resumeInstances(ids: string[]): Observable<any[]> { return this.http.post<any[]>('/api/instances/_resume', { ids }); }
  triggerInstances(ids: string[]): Observable<any[]> { return this.http.post<any[]>('/api/instances/_trigger', { ids }); }
  resetInstances(ids: string[]): Observable<any[]> { return this.http.post<any[]>('/api/instances/_reset', { ids }); }

  // Executions
  listExecutions(params: any): Observable<any[]> { return this.http.get<any[]>('/api/executions', { params }); }

  // Geo catalogs
  listRegions(): Observable<any[]> { return this.http.get<any[]>('/api/geo/regions'); }
  listCountries(filters?: { region?: string }): Observable<any[]> {
    const params: any = {};
    if (filters?.region) params.region = filters.region;
    return this.http.get<any[]>('/api/geo/countries', { params });
  }
}
