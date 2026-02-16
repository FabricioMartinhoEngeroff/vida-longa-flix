import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WhatsAppService]
    });

    service = TestBed.inject(WhatsAppService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should send welcome message via WhatsApp', async () => {
    const data = {
      name: 'Fabricio',
      phone: '51987654321'
    };

    const promise = service.sendWelcomeMessage(data);

    const req = httpMock.expectOne(request => 
      request.url.includes('/public/onboarding') &&
      request.url.includes('name=Fabricio') &&
      request.url.includes('phone=51987654321')
    );

    expect(req.request.method).toBe('POST');
    req.flush('Mensagem de boas-vindas enviada para Fabricio');

    await promise;
  });

  it('should handle errors when sending WhatsApp', async () => {
  const data = {
    name: 'Test',
    phone: '11987654321'
  };

  const promise = service.sendWelcomeMessage(data);

  const req = httpMock.expectOne(request => 
    request.url.includes('/public/onboarding')
  );

  req.flush('Twilio error', { status: 500, statusText: 'Server Error' });

  try {
    await promise;
    fail('Should have thrown an error');
  } catch (error) {
    expect(error).toBeTruthy();
  }
  });
});
