import { HttpErrorResponse } from '@angular/common/http';

export function tratarErroApi(error: unknown, mensagemPadrao: string): never {
  console.error('🚨 Erro na API:', error);

  let mensagem = mensagemPadrao;

  // Erro do HttpClient (Angular)
  if (error instanceof HttpErrorResponse) {
    if (error.error) {
      // backend pode devolver { message: "..." } ou texto puro
      const msg =
        typeof error.error === 'string'
          ? error.error
          : (error.error?.message as string | undefined);

      if (msg) mensagem = msg;
    }

    console.error(`❌ Status: ${error.status}`);
    console.error('📝 Corpo:', error.error);
  }

  // Erro genérico JS
  else if (error instanceof Error) {
    console.error('Erro:', error.message);
    mensagem = error.message || mensagemPadrao;
  }

  throw new Error(mensagem);
}
