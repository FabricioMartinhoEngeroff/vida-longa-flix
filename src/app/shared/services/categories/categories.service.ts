import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CategoryType } from '../../types/videos';

type CreateCategoryPayload = {
  name: string;
  type: CategoryType;
};

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  list(type: CategoryType) {
    return this.http.get<Category[]>(this.baseUrl, { params: { type } });
  }

  create(payload: CreateCategoryPayload) {
    return this.http.post<Category>(this.baseUrl, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  async ensureCategoryId(type: CategoryType, rawName: string, known: Category[] = []): Promise<string> {
    const name = (rawName ?? '').trim();
    if (!name) throw new Error('Nome da categoria é obrigatório');

    const normalized = this.normalizeForComparison(name);

    // 1. Tenta achar na lista local
    const found = known.find((c) => this.normalizeForComparison(c.name) === normalized);
    if (found?.id) return found.id;

    // 2. Tenta achar na lista atualizada da API
    const fresh = await firstValueFrom(this.list(type));
    const freshFound = fresh.find((c) => this.normalizeForComparison(c.name) === normalized);
    if (freshFound?.id) return freshFound.id;

    // 3. Nao existe — cria automaticamente
    const created = await firstValueFrom(this.create({ name, type }));
    if (created?.id) return created.id;

    // 4. Backend pode retornar sem id — busca a lista de novo para pegar o id
    const afterCreate = await firstValueFrom(this.list(type));
    const justCreated = afterCreate.find((c) => this.normalizeForComparison(c.name) === normalized);
    if (justCreated?.id) return justCreated.id;

    throw new Error(`Erro ao criar categoria "${name}". Verifique o backend.`);
  }

  private normalizeForComparison(value: string): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
