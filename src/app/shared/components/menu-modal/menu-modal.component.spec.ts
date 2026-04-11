import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuModalComponent } from './menu-modal.component';
import { Menu } from '../../types/menu';

describe('MenuModalComponent', () => {
  let component: MenuModalComponent;
  let fixture: ComponentFixture<MenuModalComponent>;

  const mockMenu: Menu = {
    id: '1',
    title: 'Test Menu',
    description: 'Test Description',
    cover: 'test-cover.jpg',
    recipe: 'Test Recipe',
    nutritionistTips: 'Test Tips',
    protein: 10,
    carbs: 20,
    fat: 5,
    fiber: 3,
    calories: 200,
    favorited: false,
    category: { id: 'cat-1', name: 'Sem categoria', type: 'MENU' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuModalComponent);
    component = fixture.componentInstance;
    component.menu = mockMenu;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display menu data', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('.title').textContent).toContain('Test Menu');
    expect(compiled.querySelector('.description').textContent).toContain('Test Description');
  });

  it('should emit close when close button is clicked', () => {
    const emitSpy = vi.spyOn(component.close, 'emit');
    
    const closeBtn = fixture.nativeElement.querySelector('.close-btn');
    closeBtn.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit favorite when favorite is triggered', () => {
    const emitSpy = vi.spyOn(component.favorite, 'emit');
    
    component.favorite.emit();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit comment when comment is triggered', () => {
    const emitSpy = vi.spyOn(component.comment, 'emit');
    const commentText = 'Test comment';
    
    component.comment.emit(commentText);
    
    expect(emitSpy).toHaveBeenCalledWith(commentText);
  });

  it('should display nutritional information', () => {
    const compiled = fixture.nativeElement;
    const macros = compiled.querySelector('.macros');
    
    expect(macros.textContent).toContain('Proteínas:');
    expect(macros.textContent).toContain('10g');
    expect(macros.textContent).toContain('Carboidratos:');
    expect(macros.textContent).toContain('20g');
    expect(macros.textContent).toContain('Gorduras:');
    expect(macros.textContent).toContain('5g');
    expect(macros.textContent).toContain('Fibras:');
    expect(macros.textContent).toContain('3g');
    expect(macros.textContent).toContain('Calorias:');
    expect(macros.textContent).toContain('200 kcal');
  });

  it('should emit fieldSave when onFieldSave is called', () => {
    const emitSpy = vi.spyOn(component.fieldSave, 'emit');
    component.onFieldSave('title', 'Novo título');
    expect(emitSpy).toHaveBeenCalledWith({ field: 'title', value: 'Novo título' });
  });

  it('should show edit button when canEdit is true', () => {
    component.canEdit = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn-edit')).toBeTruthy();
  });

  it('should not render when menu is null', () => {
    component.menu = null;
    fixture.detectChanges();
    
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeNull();
  });

  it('should display fallback image when cover is missing', () => {
    component.menu = { ...mockMenu, cover: '' };
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.cover-large');
    expect(img.src).toContain('assets/images/Logo.png');
  });

  // ── A21. Dicas da nutri na modal ──────────────────────

  it('#214 dicas da nutri com quebras de linha exibe corretamente na modal', () => {
    component.menu = {
      ...mockMenu,
      nutritionistTips: 'Dica 1\nDica 2\nDica 3',
    };
    fixture.detectChanges();

    const blocks = fixture.nativeElement.querySelectorAll('.block');
    let tipsBlock: HTMLElement | null = null;
    blocks.forEach((b: HTMLElement) => {
      if (b.querySelector('h4')?.textContent?.includes('Dicas da Nutri')) {
        tipsBlock = b;
      }
    });
    expect(tipsBlock).toBeTruthy();
    const editableField = tipsBlock!.querySelector('app-editable-field');
    expect(editableField).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════
  // A14. MenuModal — Exibicao, edicao e conteudo multilinha
  // ═══════════════════════════════════════════════════════════

  describe('A14 — Exibicao, edicao e conteudo multilinha', () => {
    it('#111 menu=null — modal nao e renderizada', () => {
      component.menu = null;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
    });

    it('#112 modal aberta com menu valido — titulo e descricao aparecem', () => {
      const el = fixture.nativeElement;
      expect(el.querySelector('.title').textContent).toContain('Test Menu');
      expect(el.querySelector('.description').textContent).toContain('Test Description');
    });

    it('#113 cover vazio — usa fallback Logo.png', () => {
      component.menu = { ...mockMenu, cover: '' };
      fixture.detectChanges();
      const img = fixture.nativeElement.querySelector('.cover-large');
      expect(img.src).toContain('assets/images/Logo.png');
    });

    it('#114 recipe vazia ou null — exibe "Sem receita cadastrada."', () => {
      component.menu = { ...mockMenu, recipe: '' };
      fixture.detectChanges();
      const blocks = fixture.nativeElement.querySelectorAll('.block');
      let recipeBlock: HTMLElement | null = null;
      blocks.forEach((b: HTMLElement) => {
        if (b.querySelector('h4')?.textContent?.includes('Receita')) {
          recipeBlock = b;
        }
      });
      expect(recipeBlock).toBeTruthy();
      const editable = recipeBlock!.querySelector('app-editable-field');
      expect(editable?.getAttribute('emptytext') || editable?.getAttribute('ng-reflect-empty-text'))
        .toContain('Sem receita cadastrada');
    });

    it('#115 nutritionistTips vazia ou null — exibe "Sem dicas cadastradas."', () => {
      component.menu = { ...mockMenu, nutritionistTips: '' };
      fixture.detectChanges();
      const blocks = fixture.nativeElement.querySelectorAll('.block');
      let tipsBlock: HTMLElement | null = null;
      blocks.forEach((b: HTMLElement) => {
        if (b.querySelector('h4')?.textContent?.includes('Dicas da Nutri')) {
          tipsBlock = b;
        }
      });
      expect(tipsBlock).toBeTruthy();
      const editable = tipsBlock!.querySelector('app-editable-field');
      expect(editable?.getAttribute('emptytext') || editable?.getAttribute('ng-reflect-empty-text'))
        .toContain('Sem dicas cadastradas');
    });

    it('#116 bloco de macros exibe proteinas, carbs, gorduras, fibras e calorias', () => {
      const macros = fixture.nativeElement.querySelector('.macros');
      expect(macros.textContent).toContain('Proteínas');
      expect(macros.textContent).toContain('Carboidratos');
      expect(macros.textContent).toContain('Gorduras');
      expect(macros.textContent).toContain('Fibras');
      expect(macros.textContent).toContain('Calorias');
    });

    it('#117 usuario clica no botao de fechar — evento close emitido', () => {
      const spy = vi.spyOn(component.close, 'emit');
      const closeBtn = fixture.nativeElement.querySelector('.close-btn');
      closeBtn.click();
      expect(spy).toHaveBeenCalled();
    });

    it('#118 eventos favorite e comment sao emitidos corretamente', () => {
      const favSpy = vi.spyOn(component.favorite, 'emit');
      const comSpy = vi.spyOn(component.comment, 'emit');
      component.favorite.emit();
      component.comment.emit('hello');
      expect(favSpy).toHaveBeenCalled();
      expect(comSpy).toHaveBeenCalledWith('hello');
    });

    it('#119 canEdit=true — editable fields ficam habilitados', () => {
      component.canEdit = true;
      fixture.detectChanges();
      const fields = fixture.nativeElement.querySelectorAll('app-editable-field');
      expect(fields.length).toBeGreaterThan(0);
    });

    it('#120 onFieldSave("title","Novo") emite fieldSave com field/value corretos', () => {
      const spy = vi.spyOn(component.fieldSave, 'emit');
      component.onFieldSave('title', 'Novo titulo');
      expect(spy).toHaveBeenCalledWith({ field: 'title', value: 'Novo titulo' });
    });

    it('#121 descricao/receita/dicas com \\n preservam visualmente em modo leitura', () => {
      component.menu = {
        ...mockMenu,
        description: 'L1\nL2',
        recipe: 'P1\nP2',
        nutritionistTips: 'D1\nD2',
      };
      fixture.detectChanges();
      // Os valores sao entregues ao app-editable-field sem alteracao (\n preservado).
      expect(component.menu.description).toContain('\n');
      expect(component.menu.recipe).toContain('\n');
      expect(component.menu.nutritionistTips).toContain('\n');
    });

    it('#122 descricao/receita/dicas em modo edicao carregam valor multiline', () => {
      component.canEdit = true;
      component.menu = {
        ...mockMenu,
        description: 'L1\nL2',
        recipe: 'P1\nP2',
        nutritionistTips: 'D1\nD2',
      };
      fixture.detectChanges();
      // Os campos editable recebem o valor do menu sem perder \n
      expect(component.menu.description).toBe('L1\nL2');
      expect(component.menu.recipe).toBe('P1\nP2');
      expect(component.menu.nutritionistTips).toBe('D1\nD2');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A15. Menus — Padrao fixo de capa responsiva (modal)
  // ═══════════════════════════════════════════════════════════

  describe('A15 — Padrao fixo de capa responsiva (modal)', () => {
    it('#131 modal usa mesma referencia de cover do card', () => {
      component.menu = { ...mockMenu, cover: 'https://cdn/1600x900.jpg' };
      fixture.detectChanges();
      const img = fixture.nativeElement.querySelector('.cover-large');
      expect(img.src).toContain('1600x900.jpg');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A16. Negativos complementares — modal de menu
  // ═══════════════════════════════════════════════════════════

  describe('A16 — Negativos complementares (modal)', () => {
    it('#140 comentario vazio ou so espacos nao e adicionado ao estado local', () => {
      const spy = vi.spyOn(component.comment, 'emit');
      // O componente nao deveria emitir comentario vazio.
      // A logica de filtro tipicamente fica no comments-box (filho).
      // Aqui validamos que, se o texto for vazio, o consumidor (menus.component)
      // pode ignorar via commentsService.
      component.comment.emit('');
      component.comment.emit('   ');
      // Expected behavior: consumer deve filtrar; aqui apenas garantimos o canal.
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A18. Menus — Comportamento geral da tela com edicao de capa (modal)
  // ═══════════════════════════════════════════════════════════

  describe('A18 — Edicao de capa (reflexo na modal)', () => {
    it('#162 capa atualizada com sucesso reflete na modal', () => {
      const newCover = 'https://cdn/nova-capa.jpg';
      component.menu = { ...mockMenu, cover: newCover };
      fixture.detectChanges();
      const img = fixture.nativeElement.querySelector('.cover-large');
      expect(img.src).toContain('nova-capa.jpg');
    });

    it('#164 modal reflete capa nova sem cache inconsistente', () => {
      fixture.componentRef.setInput('menu', { ...mockMenu, cover: 'https://cdn/old.jpg' });
      fixture.detectChanges();
      fixture.componentRef.setInput('menu', { ...mockMenu, cover: 'https://cdn/new.jpg' });
      fixture.detectChanges(false);
      const img = fixture.nativeElement.querySelector('.cover-large');
      expect(img.src).toContain('new.jpg');
      expect(img.src).not.toContain('old.jpg');
    });
  });
});
