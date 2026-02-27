import { HttpErrorResponse } from '@angular/common/http';

export function handleApiError(error: any, context: string): Error {
  if (error instanceof HttpErrorResponse) {
    return new Error(error.error?.message || context);
  }

  return new Error(error?.message || context);
}
