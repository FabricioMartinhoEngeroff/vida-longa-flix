import { TestBed } from '@angular/core/testing';
import { MaskService } from './mask.service';

describe('MaskService', () => {
  let service: MaskService;

  beforeEach(() => {

    TestBed.configureTestingModule({});
    
    service = TestBed.inject(MaskService);
  });

  it('should apply mask according to type', () => {
    expect(service.apply('12345678900', 'cpf')).toBe('123.456.789-00');
    expect(service.apply('12345678', 'zipcode')).toBe('12345-678');
  });

  it('should remove mask', () => {
    expect(service.remove('(11) 98765-4321')).toBe('11987654321');
  });

  it('should validate when value is complete for type', () => {
    expect(service.isComplete('123.456.789-00', 'cpf')).toBe(true);
    expect(service.isComplete('12345-67', 'zipcode')).toBe(false);
  });

  it('should return original value for unmapped type', () => {
    expect(service.apply('abc', 'unknown' as any)).toBe('abc');
  });
});