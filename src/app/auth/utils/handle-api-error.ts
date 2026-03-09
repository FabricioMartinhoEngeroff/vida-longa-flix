import { HttpErrorResponse } from '@angular/common/http';

export type HandledApiError = Error & {
  code?: string;
  queuePosition?: number;
  status?: number;
};

export function handleApiError(error: any, context: string): HandledApiError {
  if (error instanceof HttpErrorResponse) {
    const payload = error.error;
    const message = payload?.message
      || payload?.error
      || (typeof payload === 'string' ? payload : undefined)
      || context;

    return Object.assign(new Error(message), {
      code: payload?.error,
      queuePosition: payload?.queuePosition,
      status: error.status,
    });
  }

  return Object.assign(new Error(error?.message || context), {
    code: error?.code,
    queuePosition: error?.queuePosition,
    status: error?.status,
  });
}
