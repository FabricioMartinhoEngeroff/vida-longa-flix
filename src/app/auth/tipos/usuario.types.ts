/**
 * ========================================
 * TIPOS DE USUÁRIO E AUTENTICAÇÃO
 * ========================================
 * Consolidação de todos os tipos relacionados a usuário
 */

// ============================================================
// 1. ENDEREÇO
// ============================================================
export interface Endereco {
  rua: string;
  numero: string;  // ← Campo que estava faltando!
  bairro: string;
  cidade: string;
  estado: string;  // UF (ex: "RS", "SP")
  cep: string;
}

// ============================================================
// 2. REGISTRO (Cadastro simplificado - 4 campos)
// ============================================================
export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}


// ============================================================
// 3. LOGIN
// ============================================================
export interface DadosLogin {
  email: string;
  password: string;
  manterConectado: boolean;
}

// ============================================================
// 4. PERFIL COMPLETO (Para edição no modal)
// ============================================================
export interface DadosPerfil {
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: Endereco;
}

// ============================================================
// 5. ATUALIZAÇÃO PARCIAL (PATCH)
// ============================================================
export interface AtualizarPerfil {
  nome?: string;
  cpf?: string;
  telefone?: string;
  endereco?: Partial<Endereco>;
  foto?: string | null;
}

// ============================================================
// 6. USUÁRIO COMPLETO (Estado final)
// ============================================================
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: Endereco;
  foto?: string | null;
  perfilCompleto: boolean;  // ← Indica se completou cadastro
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// ============================================================
// 7. AUTENTICAÇÃO (Respostas da API)
// ============================================================
export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// ============================================================
// 8. MUDAR SENHA
// ============================================================
export interface MudarSenha {
  senhaAtual: string;
  novaSenha: string;
}

// ============================================================
// 9. RECUPERAR SENHA
// ============================================================
export interface RecuperarSenha {
  email: string;
}

export interface RedefinirSenha {
  token: string;
  novaSenha: string;
}

// ============================================================
// 10. TYPE GUARDS (Helpers para validação)
// ============================================================

/**
 * Verifica se o usuário tem perfil completo
 */
export function perfilEstaCompleto(usuario: Usuario): boolean {
  return !!(
    usuario.nome &&
    usuario.email &&
    usuario.cpf &&
    usuario.telefone &&
    usuario.endereco?.rua &&
    usuario.endereco?.numero &&
    usuario.endereco?.bairro &&
    usuario.endereco?.cidade &&
    usuario.endereco?.estado &&
    usuario.endereco?.cep
  );
}

/**
 * Cria um usuário inicial com campos vazios
 */
export function criarUsuarioVazio(): Partial<Usuario> {
  return {
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
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
