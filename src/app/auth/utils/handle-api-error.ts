import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export function handleApiError(error: any, context: string): Error {
  if (!environment.production) {
    console.error('API Error:', error);

    if (error?.status) {
      console.error(`Status: ${error.status}`);
      console.error('Body:', error.error);
    } else if (error?.message) {
      console.error('Error:', error.message);
    }
  }

  if (error instanceof HttpErrorResponse) {
    return new Error(error.error?.message || context);
  }

  return new Error(error?.message || context);
}