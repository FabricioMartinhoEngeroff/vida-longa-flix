import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsvImportService, CsvImportResult } from './csv-import.service';
import { environment } from '../../../../environments/environment';

describe('CsvImportService', () => {
  let service: CsvImportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CsvImportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should POST FormData to the given endpoint', () => {
    const file = new File(['col1,col2\na,b'], 'test.csv', { type: 'text/csv' });

    service.upload('/admin/import/videos', file).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBeTruthy();
    req.flush({ imported: 1, errors: [] });
  });

  it('should return CsvImportResult on success', () => {
    const file = new File(['data'], 'menus.csv', { type: 'text/csv' });
    const expected: CsvImportResult = { imported: 5, skipped: 1, errors: ["Linha 3: err"] };

    let result: CsvImportResult | undefined;
    service.upload('/admin/import/menus', file).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/menus`);
    req.flush(expected);

    expect(result).toEqual(expected);
  });

  it('should propagate HTTP errors', () => {
    const file = new File(['data'], 'bad.csv', { type: 'text/csv' });

    let error: any;
    service.upload('/admin/import/videos', file).subscribe({
      error: (e) => (error = e),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(error.status).toBe(500);
  });
});
