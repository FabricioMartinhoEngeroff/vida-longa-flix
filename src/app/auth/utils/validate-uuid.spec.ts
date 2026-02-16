import { validateUUID } from './validate-uuid';

describe('validateUUID', () => {
  it('should validate correct UUID', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('should reject invalid UUID', () => {
    expect(validateUUID('123')).toBe(false);
    expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });
});