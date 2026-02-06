import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DadosPerfil, DadosRegistro, Usuario } from '../tipos/usuario.types';


@Injectable({
  providedIn: 'root'
})
export class UsuarioAutenticacaoService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private router: Router) {
    this.carregarSessao();
  }

  private carregarSessao() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        this.usuarioSubject.next(JSON.parse(userData));
      } catch {
        this.limparSessao();
      }
    }
  }

  async registrar(dados: DadosRegistro): Promise<Usuario> {
    const token = 'token_fake_' + Date.now();
    
  
    const usuario: Usuario = {
      id: Date.now().toString(),
      nome: dados.nome,
      email: dados.email,
      cpf: '',              
      telefone: '',         
      endereco: undefined,  
      foto: null,
      perfilCompleto: false,  
      dataCriacao: new Date()
    };

    this.salvarSessao(token, usuario);
    return usuario;
  }

  async login(email: string, senha: string): Promise<Usuario> {
   const token = 'token_fake_' + Date.now();
    
    const usuario: Usuario = {
      id: '1',
      nome: 'Fabricio Engeroff',
      email: email,
      cpf: '12345678900',
      telefone: '51987654321',
      endereco: {
        rua: 'Rua Exemplo',
        numero: '123',
        bairro: 'Centro',
        cidade: 'Porto Alegre',
        estado: 'RS',
        cep: '90000000'
      },
      foto: null,
      perfilCompleto: true,  // ← Fabricio já completou
      dataCriacao: new Date('2024-01-01')
    };

    this.salvarSessao(token, usuario);
    return usuario;
  }

  
  async atualizarPerfil(dados: DadosPerfil): Promise<Usuario> {
    const usuarioAtual = this.usuario;
    if (!usuarioAtual) {
      throw new Error('Usuário não autenticado');
    }

    const usuarioAtualizado: Usuario = {
      ...usuarioAtual,
      nome: dados.nome,
      email: dados.email,
      cpf: dados.cpf || '',
      telefone: dados.telefone || '',
      endereco: dados.endereco,
      perfilCompleto: true,  // ← AGORA SIM, completo!
      dataAtualizacao: new Date()
    };

    const token = this.token || 'token_fake_' + Date.now();
    this.salvarSessao(token, usuarioAtualizado);
    
    return usuarioAtualizado;
  }

  /**
   * Atualiza só a foto
   */
  async atualizarFoto(foto: string | null): Promise<void> {
    const usuarioAtual = this.usuario;
    if (!usuarioAtual) {
      throw new Error('Usuário não autenticado');
    }

    const usuarioAtualizado: Usuario = {
      ...usuarioAtual,
      foto: foto,
      dataAtualizacao: new Date()
    };

    const token = this.token || 'token_fake_' + Date.now();
    this.salvarSessao(token, usuarioAtualizado);
  }

  private salvarSessao(token: string, usuario: Usuario) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  logout() {
    this.limparSessao();
    this.router.navigate(['/autorizacao']);
  }

  private limparSessao() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.usuarioSubject.next(null);
  }

  get usuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLogado(): boolean {
    return !!this.token;
  }
}