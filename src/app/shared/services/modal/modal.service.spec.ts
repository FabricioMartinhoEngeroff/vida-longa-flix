import { TestBed } from '@angular/core/testing';
import { ModalService, Video } from './modal.service';
import { ViewHistoryService } from '../view-history/view-history.service';

describe('ModalService', () => {
  let service: ModalService;
  let viewHistoryMock: jasmine.SpyObj<ViewHistoryService>;

  const mockVideo: Video = {
    id: '1',
    title: 'Test Video',
    url: 'http://test.com/video.mp4'
  };

  beforeEach(() => {
    // Cria mock do ViewHistoryService
    viewHistoryMock = jasmine.createSpyObj('ViewHistoryService', ['registerView']);

    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: ViewHistoryService, useValue: viewHistoryMock }
      ]
    });

    service = TestBed.inject(ModalService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should start with modal closed', () => {
    expect(service.selectedVideo()).toBeNull();
    expect(service.isModalOpen()).toBe(false);
  });

  it('should open modal with video', () => {
    service.open(mockVideo);

    expect(service.selectedVideo()).toEqual(mockVideo);
    expect(service.isModalOpen()).toBe(true);
  });

  it('should register view when opening modal', () => {
    localStorage.setItem('userEmail', 'test@email.com');

    service.open(mockVideo);

    expect(viewHistoryMock.registerView).toHaveBeenCalledWith('test@email.com', '1');
  });

  it('should use guest email when user is not logged in', () => {
    service.open(mockVideo);

    expect(viewHistoryMock.registerView).toHaveBeenCalledWith('guest@local', '1');
  });

  it('should close modal', () => {
    service.open(mockVideo);
    expect(service.isModalOpen()).toBe(true);

    service.close();

    expect(service.selectedVideo()).toBeNull();
    expect(service.isModalOpen()).toBe(false);
  });

  it('should check if specific video is open', () => {
    expect(service.isVideoOpen('1')).toBe(false);

    service.open(mockVideo);
    expect(service.isVideoOpen('1')).toBe(true);
    expect(service.isVideoOpen('2')).toBe(false);

    service.close();
    expect(service.isVideoOpen('1')).toBe(false);
  });

  it('should update isModalOpen reactively', () => {
    expect(service.isModalOpen()).toBe(false);

    service.open(mockVideo);
    expect(service.isModalOpen()).toBe(true);

    service.close();
    expect(service.isModalOpen()).toBe(false);
  });
});