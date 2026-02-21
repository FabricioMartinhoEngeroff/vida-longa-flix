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
});