import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicoRecuperacaoSenha {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Valida se o token de recuperação é válido
   */
  async validarToken(token: string): Promise<boolean> {
    console.log('🔍 Validando token:', token);
    
    // TODO: Quando tiver backend
    // const response = await this.http.get(`${this.apiUrl}/auth/validar-token/${token}`).toPromise();
    // return response.valido;

    // Simula validação (aceita qualquer token por enquanto)
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  /**
   * Redefine a senha usando o token
   */
  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    console.log('🔐 Redefinindo senha com token:', token);
    
    // TODO: Quando tiver backend
    // await this.http.post(`${this.apiUrl}/auth/redefinir-senha`, { token, novaSenha }).toPromise();

    // Simula delay do backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Senha redefinida com sucesso');
  }
}