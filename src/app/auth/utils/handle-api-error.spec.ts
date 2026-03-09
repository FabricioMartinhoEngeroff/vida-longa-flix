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

    expect(handleApiError(httpError, 'Default').message).toBe('Backend error');
  });

  it('should read HttpErrorResponse error field when message is absent', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const httpError = new HttpErrorResponse({
      status: 400,
      error: { error: 'Backend error field' },
    });

    expect(handleApiError(httpError, 'Default').message).toBe('Backend error field');
  });

  it('should preserve backend error metadata for queue handling', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const httpError = new HttpErrorResponse({
      status: 403,
      error: {
        error: 'ACCOUNT_QUEUED',
        message: 'Sua conta esta na fila de espera.',
        queuePosition: 5,
      },
    });

    const handled = handleApiError(httpError, 'Default');

    expect(handled.message).toBe('Sua conta esta na fila de espera.');
    expect(handled.code).toBe('ACCOUNT_QUEUED');
    expect(handled.queuePosition).toBe(5);
    expect(handled.status).toBe(403);
  });

  it('should use generic JS error message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(handleApiError(new Error('Network failure'), 'Default').message).toBe('Network failure');
  });

  it('should fall back to default message when error is not mapped', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(handleApiError({ any: true }, 'Default message').message).toBe('Default message');
  });

  it('#195 HttpErrorResponse com body string — usa string como mensagem', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const httpError = new HttpErrorResponse({
      status: 400,
      error: 'String body error',
    });

    expect(handleApiError(httpError, 'Default').message).toBe('String body error');
  });

  it('#196 HttpErrorResponse com body vazio — usa contexto', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const httpError = new HttpErrorResponse({
      status: 500,
      error: {},
    });

    expect(handleApiError(httpError, 'Erro ao fazer login').message).toBe('Erro ao fazer login');
  });
});
