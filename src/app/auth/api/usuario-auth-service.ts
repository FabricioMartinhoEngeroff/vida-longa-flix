import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { ServicoAutenticacao } from './servico-autenticacao';
import { Usuario, DadosRegistro, DadosPerfil } from '../tipos/usuario.types';
import { NotificacaoService } from '../../compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { MENSAGENS_PADRAO } from '../../compartilhado/servicos/mensagem-alerta/mensagens-padrao.constants';

@Injectable({ providedIn: 'root' })
export class UsuarioAutenticacaoService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private auth: ServicoAutenticacao,
    private router: Router,
    private notificacaoService: NotificacaoService  // ← ADICIONADO
  ) {
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

  /**
   * Registra novo usuário (só nome, email, senha)
   * Perfil fica INCOMPLETO
   */
  async registrar(dados: DadosRegistro): Promise<Usuario> {
    // TODO: Chamar backend real
    // const response = await this.http.post('/api/auth/register', dados).toPromise();
    
    const token = 'token_fake_' + Date.now();
    
    // ✅ Usuário NOVO = perfil INCOMPLETO
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

  /**
   * Login (só email e senha)
   */
  async login(email: string, senha: string): Promise<Usuario> {
    // TODO: Chamar backend real
    // const response = await this.http.post('/api/auth/login', { email, senha }).toPromise();
    
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
      perfilCompleto: true,
      dataCriacao: new Date('2024-01-01')
    };

    this.salvarSessao(token, usuario);
    return usuario;
  }

  /**
   * Busca usuário autenticado
   */
  async fetchAuthenticatedUser(): Promise<Usuario | null> {
    const token = this.auth.getToken();
    
    // Modo DEV
    if (token === 'token_dev_123') {
      return {
        id: '1',
        nome: 'Fabricio (DEV)',
        email: 'fa.engeroff@gmail.com',
        telefone: '',
        cpf: '',
        endereco: { 
          rua: '', 
          numero: '',   
          bairro: '', 
          cidade: '', 
          estado: '', 
          cep: '' 
        },
        foto: null,
        perfilCompleto: false
      };
    }

    if (!token) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.SESSAO_EXPIRADA);
      this.router.navigateByUrl('/login');
      return null;
    }

    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response = await firstValueFrom(
        this.http.get<Usuario>(`${this.api.baseURL}/users/me`, { headers })
      );

      return response ?? null;
    } catch (error) {
      this.notificacaoService.erro('Erro ao buscar usuário autenticado.');  // ← MUDADO
      return null;
    }
  }

  /**
   * Atualiza o perfil completo
   */
  async atualizarPerfil(dados: DadosPerfil): Promise<Usuario> {
    const usuarioAtual = this.usuario;
    if (!usuarioAtual) {
      throw new Error('Usuário não autenticado');
    }

    // TODO: Chamar backend real
    // await this.http.patch(`/api/usuarios/${usuarioAtual.id}`, dados).toPromise();

    const usuarioAtualizado: Usuario = {
      ...usuarioAtual,
      nome: dados.nome,
      email: dados.email,
      cpf: dados.cpf || '',
      telefone: dados.telefone || '',
      endereco: dados.endereco,
      perfilCompleto: true,
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