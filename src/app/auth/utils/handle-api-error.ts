import { HttpErrorResponse } from '@angular/common/http';

export function handleApiError(error: unknown, defaultMessage: string): never {
  console.error('🚨 API Error:', error);

  let message = defaultMessage;

  if (error instanceof HttpErrorResponse) {
    if (error.error) {
      const msg =
        typeof error.error === 'string'
          ? error.error
          : (error.error?.message as string | undefined);

      if (msg) message = msg;
    }

    console.error(`❌ Status: ${error.status}`);
    console.error('📝 Body:', error.error);
  }

  else if (error instanceof Error) {
    console.error('Error:', error.message);
    message = error.message || defaultMessage;
  }

  throw new Error(message);
}