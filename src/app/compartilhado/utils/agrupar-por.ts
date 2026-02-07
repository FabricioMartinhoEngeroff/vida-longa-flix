export type Grupo<T> = { nome: string; itens: T[] };

export function agruparPor<T>(
  list: T[],
  getNome: (item: T) => string,
  ordem?: string[]
): Grupo<T>[] {
  const mapa = new Map<string, T[]>();

  for (const item of list) {
    const nome = getNome(item) || 'Sem categoria';
    const arr = mapa.get(nome) ?? [];
    arr.push(item);
    mapa.set(nome, arr);
  }

  let grupos = Array.from(mapa.entries()).map(([nome, itens]) => ({ nome, itens }));

  if (ordem?.length) {
    const prioridade = new Map(ordem.map((n, i) => [n, i]));
    grupos = grupos.sort(
      (a, b) => (prioridade.get(a.nome) ?? 999) - (prioridade.get(b.nome) ?? 999)
    );
  }

  return grupos;
}
