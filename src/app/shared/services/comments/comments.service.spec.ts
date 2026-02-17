import { TestBed } from '@angular/core/testing';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentsService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should separate comments by type and id', () => {
    service.add('video', '1', 'video comment');
    service.add('menu', '1', 'menu comment');

    expect(service.get('video', '1')).toEqual(['Você: video comment']);
    expect(service.get('menu', '1')).toEqual(['Você: menu comment']);
  });

  it('should not add empty comment', () => {
    service.add('video', '9', '   ');
    expect(service.get('video', '9')).toEqual([]);
  });

  it('should accumulate multiple comments', () => {
    service.add('video', '1', 'first comment');
    service.add('video', '1', 'second comment');

    const comments = service.get('video', '1');
    expect(comments.length).toBe(2);
    expect(comments[0]).toBe('Você: first comment');
    expect(comments[1]).toBe('Você: second comment');
  });

  it('should return empty array for non-existent entity', () => {
    const comments = service.get('video', '999');
    expect(comments).toEqual([]);
  });

  it('should clear comments for specific entity', () => {
    service.add('video', '1', 'comment 1');
    service.add('video', '1', 'comment 2');
    
    service.clear('video', '1');
    
    expect(service.get('video', '1')).toEqual([]);
  });

  it('should calculate total comments using computed signal', () => {
    service.add('video', '1', 'comment 1');
    service.add('video', '2', 'comment 2');
    service.add('menu', '1', 'comment 3');

    expect(service.totalComments()).toBe(3);
  });

  it('should update total comments reactively', () => {
    expect(service.totalComments()).toBe(0);
    
    service.add('video', '1', 'comment 1');
    expect(service.totalComments()).toBe(1);
    
    service.add('video', '1', 'comment 2');
    expect(service.totalComments()).toBe(2);
    
    service.clear('video', '1');
    expect(service.totalComments()).toBe(0);
  });
});