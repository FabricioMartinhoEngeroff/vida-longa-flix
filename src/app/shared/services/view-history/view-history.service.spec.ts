import { TestBed } from '@angular/core/testing';
import { ViewHistoryService } from './view-history.service';

describe('ViewHistoryService', () => {
  let service: ViewHistoryService;
  const testEmail = 'test@email.com';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewHistoryService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should register video view', () => {
    service.registerView(testEmail, 'video1');
    
    expect(service.getVideoViews(testEmail, 'video1')).toBe(1);
  });

  it('should increment view count on multiple views', () => {
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video1');
    
    expect(service.getVideoViews(testEmail, 'video1')).toBe(3);
  });

  it('should track views for different videos separately', () => {
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video2');
    
    expect(service.getVideoViews(testEmail, 'video1')).toBe(2);
    expect(service.getVideoViews(testEmail, 'video2')).toBe(1);
  });

  it('should isolate views by user email', () => {
    service.registerView('user1@email.com', 'video1');
    service.registerView('user2@email.com', 'video1');
    
    expect(service.getVideoViews('user1@email.com', 'video1')).toBe(1);
    expect(service.getVideoViews('user2@email.com', 'video1')).toBe(1);
  });

  it('should return 0 for unwatched video', () => {
    expect(service.getVideoViews(testEmail, 'video999')).toBe(0);
  });

  it('should return empty object for user with no views', () => {
    const views = service.getViews('newuser@email.com');
    expect(views).toEqual({});
  });

  it('should handle corrupted localStorage data', () => {
    const key = `vida-longa-flix:views:${testEmail}`;
    localStorage.setItem(key, 'invalid-json{');
    
    const views = service.getViews(testEmail);
    expect(views).toEqual({});
  });

  it('should clear user history', () => {
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video2');
    
    service.clearHistory(testEmail);
    
    expect(service.getViews(testEmail)).toEqual({});
  });

  it('should get most watched videos', () => {
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video1');
    service.registerView(testEmail, 'video1');
    
    service.registerView(testEmail, 'video2');
    service.registerView(testEmail, 'video2');
    
    service.registerView(testEmail, 'video3');
    
    const mostWatched = service.getMostWatchedVideos(testEmail, 2);
    
    expect(mostWatched).toEqual(['video1', 'video2']);
  });

  it('should not register view with empty email', () => {
    service.registerView('', 'video1');
    expect(service.getViews('')).toEqual({});
  });

  it('should not register view with empty videoId', () => {
    service.registerView(testEmail, '');
    expect(service.getVideoViews(testEmail, '')).toBe(0);
  });
});