import { HttpErrorResponse } from '@angular/common/http';

export function handleApiError(error: any, context: string): Error {
  if (error instanceof HttpErrorResponse) {
    const payload = error.error;
    const message = payload?.message
      || payload?.error
      || (typeof payload === 'string' ? payload : undefined)
      || context;

    return new Error(message);
  }

  return new Error(error?.message || context);
}
