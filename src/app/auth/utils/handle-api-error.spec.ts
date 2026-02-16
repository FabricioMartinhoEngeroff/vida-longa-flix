import { HttpErrorResponse } from '@angular/common/http';
import { afterEach, vi } from 'vitest';
import { handleApiError } from './handle-api-error';

describe('handleApiError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should prioritize HttpErrorResponse message when it comes in object', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const httpError = new HttpErrorResponse({
      status: 400,
      error: { message: 'Backend error' },
    });

    expect(() => handleApiError(httpError, 'Default')).toThrowError('Backend error');
  });

  it('should use generic JS error message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => handleApiError(new Error('Network failure'), 'Default')).toThrowError('Network failure');
  });

  it('should fall back to default message when error is not mapped', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => handleApiError({ any: true }, 'Default message')).toThrowError('Default message');
  });
});