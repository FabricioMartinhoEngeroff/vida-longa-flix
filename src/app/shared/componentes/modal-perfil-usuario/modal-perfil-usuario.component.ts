import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificacaoService } from '../../services/alert-message/alert-message.service';
import { MENSAGENS_PADRAO } from '../../services/alert-message/default-messages.constants';
import { CampoFormularioComponent } from '../campo-formulario/campo-formulario.component';

@Component({
  selector: 'app-modal-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, CampoFormularioComponent],
  templateUrl: './modal-perfil-usuario.component.html',
  styleUrls: ['./modal-perfil-usuario.component.css']
})
export class ModalPerfilUsuarioComponent implements OnInit {
  @Input() aberta = false;
  @Input() usuario: any;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<any>();
  @Output() abrirMudarSenha = new EventEmitter<void>();

  form!: FormGroup;

  constructor(
  private fb: FormBuilder,
  private notificacaoService: NotificacaoService 
) {}


  ngOnInit() {
    this.form = this.fb.group({
      nome: [this.usuario?.nome || '', [Validators.required, Validators.minLength(3)]],
      email: [this.usuario?.email || '', [Validators.required, Validators.email]],
      cpf: [this.usuario?.cpf || '', [Validators.minLength(11)]],
      telefone: [this.usuario?.telefone || ''],
      endereco: this.fb.group({
        rua: [this.usuario?.endereco?.rua || ''],
        numero: [this.usuario?.endereco?.numero || ''],
        bairro: [this.usuario?.endereco?.bairro || ''],
        cidade: [this.usuario?.endereco?.cidade || ''],
        estado: [this.usuario?.endereco?.estado || ''],
        cep: [this.usuario?.endereco?.cep || '']
      })
    });
  }

  get end() {
    return (this.form.get('endereco') as FormGroup).controls;
  }

  erroCampo(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['minlength'])
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;

    return 'Valor inválido';
  }

  onFechar() {
    this.fechar.emit();
  }

  onSalvar() {
  this.form.markAllAsTouched();

  if (this.form.invalid) {
    this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.CAMPOS_OBRIGATORIOS);
    return;
  }

  const dados = this.form.getRawValue();
  this.salvar.emit(dados);
}

  onAbrirMudarSenha() {
    this.abrirMudarSenha.emit();
  }
}
