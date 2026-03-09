import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentsService, CommentResponse } from './comments.service';
import { environment } from '../../../../environments/environment';

describe('CommentsService', () => {
  let service: CommentsService;
  let http: HttpTestingController;

  const mockComments: CommentResponse[] = [
    { id: '1', text: 'ótimo vídeo', date: '2024-01-01', user: { id: 'u1', name: 'João' } }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CommentsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load comments by video', () => {
    service.loadByVideo('video-1');

    const req = http.expectOne(`${environment.apiUrl}/comments/video/video-1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockComments);

    expect(service.get('video-1').length).toBe(1);
    expect(service.get('video-1')[0].text).toBe('ótimo vídeo');
  });

  it('should return empty array when no comments loaded', () => {
    expect(service.get('video-999')).toEqual([]);
  });

  it('should add comment and reload', () => {
    service.add('video-1', 'novo comentário');

    const postReq = http.expectOne(`${environment.apiUrl}/comments`);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ text: 'novo comentário', videoId: 'video-1' });
    postReq.flush(null);

    const getReq = http.expectOne(`${environment.apiUrl}/comments/video/video-1`);
    getReq.flush(mockComments);

    expect(service.get('video-1').length).toBe(1);
  });

  it('should not add empty comment', () => {
    service.add('video-1', '   ');
    http.expectNone(`${environment.apiUrl}/comments`);
  });

  it('should delete comment and reload', () => {
    service.delete('comment-1', 'video-1');

    const deleteReq = http.expectOne(`${environment.apiUrl}/comments/comment-1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    const getReq = http.expectOne(`${environment.apiUrl}/comments/video/video-1`);
    getReq.flush([]);
  });

  it('should calculate totalComments reactively', () => {
    expect(service.totalComments()).toBe(0);

    service.loadByVideo('video-1');
    http.expectOne(`${environment.apiUrl}/comments/video/video-1`).flush(mockComments);

    expect(service.totalComments()).toBe(1);
  });

  // ── Race-condition tests (mobile second-comment bug) ──

  it('should cancel previous loadByVideo so stale data never overwrites fresh data', () => {
    const comment1: CommentResponse = { id: '1', text: 'primeiro', date: '2024-01-01', user: { id: 'u1', name: 'Ana' } };
    const comment2: CommentResponse = { id: '2', text: 'segundo', date: '2024-01-02', user: { id: 'u1', name: 'Ana' } };

    service.add('video-1', 'primeiro');
    http.expectOne(`${environment.apiUrl}/comments`).flush(null);

    service.add('video-1', 'segundo');
    http.expectOne(`${environment.apiUrl}/comments`).flush(null);

    const gets = http.match(`${environment.apiUrl}/comments/video/video-1`);
    expect(gets.length).toBe(2);
    expect(gets[0].cancelled).toBe(true);
    expect(gets[1].cancelled).toBe(false);

    gets[1].flush([comment1, comment2]);

    expect(service.get('video-1').length).toBe(2);
  });

  it('should keep both comments when two sequential adds complete in order', () => {
    const c1: CommentResponse = { id: '1', text: 'c1', date: '2024-01-01', user: { id: 'u1', name: 'Ana' } };
    const c2: CommentResponse = { id: '2', text: 'c2', date: '2024-01-02', user: { id: 'u1', name: 'Ana' } };

    // Add first comment — wait for full round-trip before second
    service.add('video-1', 'c1');
    http.expectOne(`${environment.apiUrl}/comments`).flush(null);
    http.expectOne(`${environment.apiUrl}/comments/video/video-1`).flush([c1]);
    expect(service.get('video-1').length).toBe(1);

    // Add second comment
    service.add('video-1', 'c2');
    http.expectOne(`${environment.apiUrl}/comments`).flush(null);
    http.expectOne(`${environment.apiUrl}/comments/video/video-1`).flush([c1, c2]);
    expect(service.get('video-1').length).toBe(2);
    expect(service.get('video-1').map(c => c.text)).toEqual(['c1', 'c2']);
  });

  it('should still work after a failed POST (second comment should publish)', () => {
    // First comment POST fails
    service.add('video-1', 'falhou');
    http.expectOne(`${environment.apiUrl}/comments`)
      .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    // No GET expected since POST failed

    // Second comment should still work
    service.add('video-1', 'funcionou');
    const post2 = http.expectOne(`${environment.apiUrl}/comments`);
    expect(post2.request.body).toEqual({ text: 'funcionou', videoId: 'video-1' });
    post2.flush(null);

    const getReq = http.expectOne(`${environment.apiUrl}/comments/video/video-1`);
    getReq.flush([{ id: '1', text: 'funcionou', date: '2024-01-01', user: { id: 'u1', name: 'Ana' } }]);

    expect(service.get('video-1').length).toBe(1);
    expect(service.get('video-1')[0].text).toBe('funcionou');
  });

  it('should cancel stale loadByVideo when a new loadByVideo is triggered', () => {
    const stale: CommentResponse = { id: '1', text: 'stale', date: '2024-01-01', user: { id: 'u1', name: 'Ana' } };
    const fresh: CommentResponse = { id: '2', text: 'fresh', date: '2024-01-02', user: { id: 'u1', name: 'Ana' } };

    // Rapid-fire three loads for the same video
    service.loadByVideo('video-1');
    service.loadByVideo('video-1');
    service.loadByVideo('video-1');

    const reqs = http.match(`${environment.apiUrl}/comments/video/video-1`);
    expect(reqs.length).toBe(3);

    // First two should be cancelled, only last is active
    expect(reqs[0].cancelled).toBe(true);
    expect(reqs[1].cancelled).toBe(true);
    expect(reqs[2].cancelled).toBe(false);

    // Only flush the active one with fresh data
    reqs[2].flush([stale, fresh]);

    // The latest (active) response should win
    expect(service.get('video-1').length).toBe(2);
  });

  it('should not break when DELETE is followed by rapid add', () => {
    const c1: CommentResponse = { id: '1', text: 'c1', date: '2024-01-01', user: { id: 'u1', name: 'Ana' } };
    const c2: CommentResponse = { id: '2', text: 'c2', date: '2024-01-02', user: { id: 'u1', name: 'Ana' } };
    const c3: CommentResponse = { id: '3', text: 'c3', date: '2024-01-03', user: { id: 'u1', name: 'Ana' } };

    // Load initial comments
    service.loadByVideo('video-1');
    http.expectOne(`${environment.apiUrl}/comments/video/video-1`).flush([c1, c2]);
    expect(service.get('video-1').length).toBe(2);

    // Delete comment 1 (triggers reload)
    service.delete('1', 'video-1');
    http.expectOne(`${environment.apiUrl}/comments/1`).flush(null);
    // GET from delete starts

    // Immediately add a new comment before delete's reload finishes
    service.add('video-1', 'c3');
    http.expectOne(`${environment.apiUrl}/comments`).flush(null);

    const gets = http.match(`${environment.apiUrl}/comments/video/video-1`);
    expect(gets.length).toBe(2);
    expect(gets[0].cancelled).toBe(true);
    expect(gets[1].cancelled).toBe(false);

    gets[1].flush([c2, c3]);

    expect(service.get('video-1').length).toBe(2);
    expect(service.get('video-1').map(c => c.text)).toEqual(['c2', 'c3']);
  });
});
