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
    console.log('%c🔍 VALIDANDO TOKEN', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Token:', token);
    console.log('⏰ Data:', new Date().toLocaleString('pt-BR'));
    
    // TODO: Quando tiver backend
    // const response = await this.http.get(`${this.apiUrl}/auth/validar-token/${token}`).toPromise();
    // return response.valido;

    // Simula validação (aceita qualquer token por enquanto)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('%c✅ TOKEN VÁLIDO!', 'background: #059669; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  }

  /**
   * Redefine a senha usando o token
   */
  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    console.log('%c🔐 REDEFININDO SENHA', 'background: #6a0dad; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Token:', token);
    console.log('🔒 Nova senha:', '••••••••' + novaSenha.slice(-4));
    console.log('⏰ Data:', new Date().toLocaleString('pt-BR'));
    
    // TODO: Quando tiver backend
    // await this.http.post(`${this.apiUrl}/auth/redefinir-senha`, { token, novaSenha }).toPromise();

    // Simula delay do backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('%c✅ SENHA REDEFINIDA COM SUCESSO!', 'background: #059669; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email de confirmação seria enviado aqui');
    console.log('🔄 Redirecionando para login em 2 segundos...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}