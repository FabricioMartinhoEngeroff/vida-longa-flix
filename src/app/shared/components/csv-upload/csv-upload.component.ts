import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CsvImportService, CsvImportResult } from '../../services/csv-import/csv-import.service';
import { NotificationService } from '../../services/alert-message/alert-message.service';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Component({
  selector: 'app-csv-upload',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './csv-upload.component.html',
  styleUrls: ['./csv-upload.component.css'],
})
export class CsvUploadComponent {
  @Input() endpoint = '';

  fileName = '';
  file: File | null = null;
  isDragging = false;
  uploading = false;
  errors: string[] = [];
  logs: string[] = [];
  elapsedSeconds = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private csvImportService: CsvImportService,
    private alert: NotificationService
  ) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.setFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnter(): void {
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.setFile(file);
  }

  clearFile(): void {
    this.fileName = '';
    this.file = null;
    this.errors = [];
  }

  importCsv(): void {
    if (!this.file || this.uploading) return;

    this.uploading = true;
    this.errors = [];
    this.logs = [];
    this.elapsedSeconds = 0;

    this.log(`Arquivo: ${this.file.name} (${(this.file.size / 1024).toFixed(1)} KB)`);
    this.log(`Endpoint: ${this.endpoint}`);
    this.log('Enviando para o servidor...');
    this.startTimer();

    this.csvImportService.upload(this.endpoint, this.file).subscribe({
      next: (result) => {
        this.stopTimer();
        this.log(`Resposta recebida em ${this.elapsedSeconds}s`);
        this.log(`Importados: ${result.imported} | Erros: ${result.errors?.length ?? 0}`);
        console.log('[CSV Import] Response:', result);
        this.handleSuccess(result);
      },
      error: (err) => {
        this.stopTimer();
        this.log(`ERRO após ${this.elapsedSeconds}s — Status: ${err.status}`);
        this.log(`Detalhe: ${err.message || err.statusText || 'Sem detalhes'}`);
        console.error('[CSV Import] Error:', err);
        this.handleError(err);
      },
    });
  }

  private log(message: string): void {
    const time = new Date().toLocaleTimeString('pt-BR');
    const entry = `[${time}] ${message}`;
    this.logs.push(entry);
    console.log(`[CSV Import] ${message}`);
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      if (this.elapsedSeconds % 5 === 0) {
        this.log(`Aguardando resposta... (${this.elapsedSeconds}s)`);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private setFile(file: File): void {
    if (!this.isValidCsv(file.name)) {
      this.alert.error('Apenas arquivos .csv são aceitos.');
      return;
    }
    if (file.size === 0) {
      this.alert.error('O arquivo está vazio.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.alert.error('Arquivo muito grande. Tamanho máximo: 50MB.');
      return;
    }

    this.fileName = file.name;
    this.file = file;
    this.errors = [];
    this.logs = [];
  }

  private isValidCsv(name: string): boolean {
    return name.toLowerCase().endsWith('.csv');
  }

  private handleSuccess(result: CsvImportResult): void {
    this.uploading = false;

    if (result.errors.length === 0) {
      this.log(`Sucesso! ${result.imported} registros importados.`);
      this.alert.success(`${result.imported} registros importados com sucesso!`);
      this.clearFile();
      return;
    }

    if (result.imported > 0) {
      this.log(`Parcial: ${result.imported} importados, ${result.errors.length} com erro.`);
      this.alert.warning(`${result.imported} importados, ${result.errors.length} com erro.`);
    } else {
      this.log('Falha: nenhum registro importado.');
      this.alert.error('Nenhum registro importado. Verifique os erros abaixo.');
    }

    this.errors = result.errors;
    this.fileName = '';
    this.file = null;
  }

  private handleError(err: any): void {
    this.uploading = false;
    this.fileName = '';
    this.file = null;

    if (err.status === 401) {
      this.log('Erro 401: não autenticado — redirecionando.');
      return;
    }
    if (err.status === 403) {
      this.log('Erro 403: sem permissão de admin.');
      this.alert.error('Sem permissão para realizar esta ação.');
      return;
    }
    if (err.status === 400) {
      this.log('Erro 400: arquivo inválido.');
      this.alert.error('Arquivo CSV inválido. Verifique o formato e tente novamente.');
      return;
    }
    if (err.status === 0) {
      this.log('Erro 0: timeout ou CORS bloqueado.');
      this.alert.error('Tempo esgotado. Tente novamente ou reduza o tamanho do arquivo.');
      return;
    }

    this.log(`Erro ${err.status}: ${err.statusText || 'desconhecido'}`);
    this.alert.error('Erro ao importar arquivo. Tente novamente.');
  }
}
