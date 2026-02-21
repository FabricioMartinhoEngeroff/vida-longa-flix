import { TestBed } from '@angular/core/testing';
import { MenuCommentsService } from './menu-comments-service';

describe('MenuCommentsService', () => {
  let service: MenuCommentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuCommentsService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should add and get comment', () => {
    service.add('1', 'ótimo cardápio');
    expect(service.get('1')).toEqual(['Você: ótimo cardápio']);
  });

  it('should not add empty comment', () => {
    service.add('1', '   ');
    expect(service.get('1')).toEqual([]);
  });

  it('should keep comments separated by id', () => {
    service.add('1', 'comentário menu 1');
    service.add('2', 'comentário menu 2');
    expect(service.get('1').length).toBe(1);
    expect(service.get('2').length).toBe(1);
  });

  it('should count total comments', () => {
    service.add('1', 'primeiro');
    service.add('2', 'segundo');
    expect(service.totalComments()).toBe(2);
  });

  it('should return empty array for unknown id', () => {
    expect(service.get('999')).toEqual([]);
  });
});