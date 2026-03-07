import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CsvImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class CsvImportService {
  constructor(private http: HttpClient) {}

  upload(endpoint: string, file: File): Observable<CsvImportResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<CsvImportResult>(`${environment.apiUrl}${endpoint}`, formData);
  }
}
