import { agruparPor } from './agrupar-por';

describe('agruparPor', () => {
  it('deve agrupar itens por nome retornado pelo callback', () => {
    const list = [
      { id: 1, categoria: 'A' },
      { id: 2, categoria: 'B' },
      { id: 3, categoria: 'A' },
    ];

    const grupos = agruparPor(list, (item) => item.categoria);

    expect(grupos.length).toBe(2);
    expect(grupos.find((g) => g.nome === 'A')?.itens.length).toBe(2);
  });

  it('deve usar "Sem categoria" quando callback retorna vazio', () => {
    const grupos = agruparPor([{ id: 1 }], () => '');

    expect(grupos[0].nome).toBe('Sem categoria');
  });

  it('deve respeitar ordem de prioridade quando fornecida', () => {
    const list = [
      { id: 1, categoria: 'B' },
      { id: 2, categoria: 'A' },
      { id: 3, categoria: 'C' },
    ];

    const grupos = agruparPor(list, (item) => item.categoria, ['C', 'A']);

    expect(grupos[0].nome).toBe('C');
    expect(grupos[1].nome).toBe('A');
  });
});
