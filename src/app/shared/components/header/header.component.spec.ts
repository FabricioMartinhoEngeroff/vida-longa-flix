import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { vi } from 'vitest';
import { signal } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SearchFieldComponent } from '../search-field/search-field.component';
import { VideoService } from '../../services/video/video.service';
import { MenuService } from '../../services/menus/menus-service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let scrollerMock: { scrollToAnchor: ReturnType<typeof vi.fn> };

  const videosSignal = signal<any[]>([]);
  const menusSignal = signal<any[]>([]);

  const videoServiceMock = { videos: videosSignal.asReadonly() };
  const menuServiceMock = { menus: menusSignal.asReadonly() };

  beforeEach(async () => {
    videosSignal.set([]);
    menusSignal.set([]);

    routerMock = { navigate: vi.fn() };
    scrollerMock = { scrollToAnchor: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: MenuService, useValue: menuServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ViewportScroller, useValue: scrollerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  /** Trigger effect without NG0100 in Angular 21 zoneless */
  function detect(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  // ── Basic ──

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img.logo');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('/assets/images/Logo.png');
  });

  it('should call onSearchChange when SearchField emits valueChange', () => {
    const spy = vi.spyOn(component, 'onSearchChange');
    const sf = fixture.debugElement.query(By.directive(SearchFieldComponent));
    sf.componentInstance.valueChange.emit('banana');
    expect(spy).toHaveBeenCalledWith('banana');
  });

  // ── B4. Regra dos 3 caracteres ──

  it('B4.16 — should NOT return suggestions when typing fewer than 3 chars', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('ba');
    expect(component.searchSuggestions.length).toBe(0);
    expect(component.searchCategories.length).toBe(0);
  });

  it('B4.17 — should return suggestions when typing exactly 3 chars', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B4.18 — should return suggestions when typing 5+ chars', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('banan');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B4.19 — should return nothing when typing only spaces', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('   ');
    expect(component.searchSuggestions.length).toBe(0);
  });

  it('B4.20 — should return nothing when typing only stop words', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('de da');
    expect(component.searchSuggestions.length).toBe(0);
  });

  // ── B5. Index reativo (bug corrigido) ──

  it('B5.21 — should return suggestions when data is available before search', () => {
    videosSignal.set([
      { id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } },
      { id: '2', title: 'Bolo de Cenoura', category: { name: 'Bolos' } },
    ]);
    menusSignal.set([
      { id: '3', title: 'Banana Split', category: { name: 'Sobremesas' } },
    ]);
    detect();

    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    expect(component.searchSuggestions).toContain('Banana Split');
  });

  it('B5.22 — should return suggestions when data loads AFTER component init (async)', () => {
    component.onSearchChange('ban');
    expect(component.searchSuggestions.length).toBe(0);

    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    menusSignal.set([{ id: '3', title: 'Banana Split', category: { name: 'Sobremesas' } }]);
    detect();

    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    expect(component.searchSuggestions).toContain('Banana Split');
  });

  it('B5.23 — should update suggestions when new videos are added', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toEqual(['Banana Smoothie']);

    videosSignal.set([
      { id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } },
      { id: '4', title: 'Banana com Aveia', category: { name: 'Cafe' } },
    ]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    expect(component.searchSuggestions).toContain('Banana com Aveia');
  });

  it('B5.24 — should update suggestions when new menus are added', () => {
    menusSignal.set([{ id: '1', title: 'Menu Banana', category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toEqual(['Menu Banana']);

    menusSignal.set([
      { id: '1', title: 'Menu Banana', category: { name: 'Frutas' } },
      { id: '2', title: 'Banana Fit', category: { name: 'Fitness' } },
    ]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Menu Banana');
    expect(component.searchSuggestions).toContain('Banana Fit');
  });

  it('B5.25 — should remove suggestions when videos are removed from signal', () => {
    videosSignal.set([
      { id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } },
      { id: '2', title: 'Banana com Aveia', category: { name: 'Cafe' } },
    ]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions.length).toBe(2);

    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toEqual(['Banana Smoothie']);
  });

  // ── B6. Busca por titulo (sugestoes) ──

  it('B6.26 — should find both video and menu titles', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    menusSignal.set([{ id: '2', title: 'Banana Split', category: { name: 'Sobremesas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    expect(component.searchSuggestions).toContain('Banana Split');
  });

  it('B6.27 — should deduplicate titles across videos and menus', () => {
    videosSignal.set([{ id: '1', title: 'Salada Tropical', category: { name: 'Saladas' } }]);
    menusSignal.set([{ id: '2', title: 'Salada Tropical', category: { name: 'Saladas' } }]);
    detect();
    component.onSearchChange('salada');
    expect(component.searchSuggestions.filter(s => s === 'Salada Tropical').length).toBe(1);
  });

  it('B6.28 — should handle diacritics (acucar matches Acucar)', () => {
    videosSignal.set([{ id: '1', title: 'Bolo sem Açúcar', category: { name: 'Bolos' } }]);
    detect();
    component.onSearchChange('acucar');
    expect(component.searchSuggestions).toContain('Bolo sem Açúcar');
  });

  it('B6.29 — should be case-insensitive (BANANA matches Banana)', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('BANANA');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B6.30 — should match tokens in any order (smoothie banana → Banana Smoothie)', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('smoothie banana');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B6.31 — should return empty when no videos/menus exist', () => {
    component.onSearchChange('banana');
    expect(component.searchSuggestions.length).toBe(0);
  });

  // ── B7. Busca por categoria ──

  it('B7.32 — should return categories when typing 3+ chars', () => {
    videosSignal.set([{ id: '1', title: 'Frango Grelhado', category: { name: 'Proteínas' } }]);
    menusSignal.set([{ id: '2', title: 'Menu Proteico', category: { name: 'Proteínas' } }]);
    detect();
    component.onSearchChange('pro');
    expect(component.searchCategories).toContain('Proteínas');
  });

  it('B7.33 — should deduplicate categories across videos and menus', () => {
    videosSignal.set([{ id: '1', title: 'Salada Caesar', category: { name: 'Saladas' } }]);
    menusSignal.set([{ id: '2', title: 'Menu Salada', category: { name: 'Saladas' } }]);
    detect();
    component.onSearchChange('salad');
    expect(component.searchCategories.filter(c => c === 'Saladas').length).toBe(1);
  });

  it('B7.34 — should NOT break when video has category null', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: null }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    // no crash, category list just doesn't include null
  });

  it('B7.35 — should return empty categories when no match', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('xyz');
    expect(component.searchCategories.length).toBe(0);
  });

  // ── B8. Ordenacao por relevancia ──

  it('B8.36 — should rank higher-scoring items first', () => {
    videosSignal.set([
      { id: '1', title: 'Bolo de Banana com Aveia', category: { name: 'Bolos' } },
      { id: '2', title: 'Banana Smoothie de Banana', category: { name: 'Bebidas' } },
    ]);
    detect();
    component.onSearchChange('banana');
    // "Banana Smoothie de Banana" has 2 token matches, "Bolo de Banana com Aveia" has 1
    expect(component.searchSuggestions[0]).toBe('Banana Smoothie de Banana');
  });

  it('B8.37 — should sort alphabetically when scores are equal', () => {
    videosSignal.set([
      { id: '1', title: 'Banana Zulu', category: { name: 'Frutas' } },
      { id: '2', title: 'Banana Alpha', category: { name: 'Frutas' } },
    ]);
    detect();
    component.onSearchChange('banana');
    expect(component.searchSuggestions[0]).toBe('Banana Alpha');
    expect(component.searchSuggestions[1]).toBe('Banana Zulu');
  });

  it('B8.38 — should NOT include items with score 0', () => {
    videosSignal.set([
      { id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } },
      { id: '2', title: 'Frango Grelhado', category: { name: 'Carnes' } },
    ]);
    detect();
    component.onSearchChange('banana');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    expect(component.searchSuggestions).not.toContain('Frango Grelhado');
  });

  // ── B9. Limpar pesquisa ──

  it('B9.39 — should clear suggestions when input is cleared', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions.length).toBeGreaterThan(0);

    component.onSearchChange('');
    expect(component.searchSuggestions.length).toBe(0);
    expect(component.searchCategories.length).toBe(0);
  });

  it('B9.40 — should clear suggestions when going below 3 useful chars', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions.length).toBeGreaterThan(0);

    component.onSearchChange('xy');
    expect(component.searchSuggestions.length).toBe(0);
  });

  // ── B10. Navegacao ao selecionar (goToSearch) ──

  it('B10.41 — should navigate to /app with video id for exact video title match', () => {
    videosSignal.set([{ id: 'v1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.goToSearch('Banana Smoothie');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'video', id: 'v1', q: 'Banana Smoothie' },
    });
  });

  it('B10.42 — should navigate to /app/menus with menu id for exact menu title match', () => {
    menusSignal.set([{ id: 'm1', title: 'Menu Fitness', category: { name: 'Fitness' } }]);
    detect();
    component.goToSearch('Menu Fitness');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/menus'], {
      queryParams: { tipo: 'menu', id: 'm1', q: 'Menu Fitness' },
    });
  });

  it('B10.43 — should navigate to /app with categoria-video for exact video category match', () => {
    videosSignal.set([{ id: 'v1', title: 'Frango', category: { name: 'Proteínas' } }]);
    detect();
    component.goToSearch('Proteínas');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'categoria-video', cat: 'Proteínas', q: 'Proteínas' },
    });
  });

  it('B10.44 — should navigate to /app/menus with categoria-menu for menu-only category', () => {
    menusSignal.set([{ id: 'm1', title: 'Menu Light', category: { name: 'Dietas' } }]);
    detect();
    component.goToSearch('Dietas');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/menus'], {
      queryParams: { tipo: 'categoria-menu', cat: 'Dietas', q: 'Dietas' },
    });
  });

  it('B10.45 — should fallback to generic search when no exact match', () => {
    videosSignal.set([{ id: 'v1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.goToSearch('algo inexistente');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { q: 'algo inexistente' },
    });
  });

  it('B10.46 — should NOT navigate when term is empty', () => {
    component.goToSearch('   ');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('B10.47 — video title match should have priority over menu title match', () => {
    videosSignal.set([{ id: 'v1', title: 'Salada Tropical', category: { name: 'Saladas' } }]);
    menusSignal.set([{ id: 'm1', title: 'Salada Tropical', category: { name: 'Saladas' } }]);
    detect();
    component.goToSearch('Salada Tropical');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'video', id: 'v1', q: 'Salada Tropical' },
    });
  });

  // ── B13. Tokenizacao e stop words ──

  it('B13.58 — should ignore stop word "de" and search by remaining token', () => {
    videosSignal.set([{ id: '1', title: 'Bolo de Banana', category: { name: 'Bolos' } }]);
    detect();
    component.onSearchChange('de banana');
    expect(component.searchSuggestions).toContain('Bolo de Banana');
  });

  it('B13.59 — should return nothing when all tokens are stop words', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('a e o as os');
    expect(component.searchSuggestions.length).toBe(0);
  });

  it('B13.60 — should return nothing for all stop words variant', () => {
    videosSignal.set([{ id: '1', title: 'Banana', category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('da do das dos um uma com para por');
    expect(component.searchSuggestions.length).toBe(0);
  });

  it('B13.61 — should accept non-stop-word token with 2 chars (e.g. "ok")', () => {
    videosSignal.set([{ id: '1', title: 'Tudo ok Banana', category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('ok banana');
    expect(component.searchSuggestions).toContain('Tudo ok Banana');
  });

  it('B13.62 — should return nothing when all tokens have 1 char each', () => {
    videosSignal.set([{ id: '1', title: 'Banana', category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('x y z');
    expect(component.searchSuggestions.length).toBe(0);
  });

  it('B13.63 — should remove stop word and search remaining tokens', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('de banana smoothie');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B13.64 — should trim extra spaces around term', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('  ban  ');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  // ── B15. Dados edge cases ──

  it('B15.68 — video with empty title should NOT appear in suggestions', () => {
    videosSignal.set([{ id: '1', title: '', category: { name: 'Bebidas' } }]);
    detect();
    component.onSearchChange('beb');
    // empty title won't match any search token
    expect(component.searchSuggestions).not.toContain('');
  });

  it('B15.69 — video with category null should NOT break', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: null }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B15.70 — video with category undefined should NOT break', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie' }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
  });

  it('B15.71 — video with empty category name should NOT appear in categories', () => {
    videosSignal.set([{ id: '1', title: 'Banana Smoothie', category: { name: '' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Banana Smoothie');
    expect(component.searchCategories).not.toContain('');
  });

  it('B15.72 — menu with category name null should NOT break', () => {
    menusSignal.set([{ id: '1', title: 'Menu Banana', category: { name: null } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Menu Banana');
  });

  it('B15.73 — title with special characters should be searchable', () => {
    videosSignal.set([{ id: '1', title: 'Bolo #1 (especial)', category: { name: 'Bolos' } }]);
    detect();
    component.onSearchChange('bolo');
    expect(component.searchSuggestions).toContain('Bolo #1 (especial)');
  });

  it('B15.74 — very long title should still be found', () => {
    const longTitle = 'Banana ' + 'muito '.repeat(30) + 'longa';
    videosSignal.set([{ id: '1', title: longTitle, category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('banana');
    expect(component.searchSuggestions).toContain(longTitle);
  });

  it('B15.75 — many results (200+ items) should all be returned', () => {
    const videos = Array.from({ length: 200 }, (_, i) => ({
      id: `v${i}`, title: `Banana Variacao ${i}`, category: { name: 'Frutas' },
    }));
    videosSignal.set(videos);
    detect();
    component.onSearchChange('banana');
    expect(component.searchSuggestions.length).toBe(200);
  });

  // ── B16. Colisao de prioridade no goToSearch ──

  it('B16.76 — video title should have priority over menu title', () => {
    videosSignal.set([{ id: 'v1', title: 'Salada', category: { name: 'Saladas' } }]);
    menusSignal.set([{ id: 'm1', title: 'Salada', category: { name: 'Saladas' } }]);
    detect();
    component.goToSearch('Salada');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'video', id: 'v1', q: 'Salada' },
    });
  });

  it('B16.77 — video title should have priority over video category', () => {
    videosSignal.set([
      { id: 'v1', title: 'Proteínas', category: { name: 'Educativo' } },
      { id: 'v2', title: 'Frango', category: { name: 'Proteínas' } },
    ]);
    detect();
    component.goToSearch('Proteínas');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'video', id: 'v1', q: 'Proteínas' },
    });
  });

  it('B16.78 — menu title should have priority over video category', () => {
    menusSignal.set([{ id: 'm1', title: 'Bebidas', category: { name: 'Outros' } }]);
    videosSignal.set([{ id: 'v1', title: 'Agua', category: { name: 'Bebidas' } }]);
    detect();
    component.goToSearch('Bebidas');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/menus'], {
      queryParams: { tipo: 'menu', id: 'm1', q: 'Bebidas' },
    });
  });

  it('B16.79 — video category should have priority over menu category', () => {
    videosSignal.set([{ id: 'v1', title: 'Frango', category: { name: 'Saladas' } }]);
    menusSignal.set([{ id: 'm1', title: 'Menu X', category: { name: 'Saladas' } }]);
    detect();
    component.goToSearch('Saladas');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'categoria-video', cat: 'Saladas', q: 'Saladas' },
    });
  });

  it('B16.80 — should fallback to generic search when no exact match', () => {
    videosSignal.set([{ id: 'v1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.goToSearch('parcial ban');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { q: 'parcial ban' },
    });
  });

  // ── B17. Navegacao — mesmo contexto e erros ──

  it('B17.81 — should navigate with correct queryParams even when already on /app', () => {
    videosSignal.set([{ id: 'v1', title: 'Banana Smoothie', category: { name: 'Bebidas' } }]);
    detect();
    component.goToSearch('Banana Smoothie');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'video', id: 'v1', q: 'Banana Smoothie' },
    });
  });

  it('B17.85 — should handle diacritics in goToSearch matching', () => {
    videosSignal.set([{ id: 'v1', title: 'Açúcar Mascavo', category: { name: 'Ingredientes' } }]);
    detect();
    component.goToSearch('Acucar Mascavo');
    // normalize should match
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app'], {
      queryParams: { tipo: 'video', id: 'v1', q: 'Acucar Mascavo' },
    });
  });

  // ── B20. Performance ──

  it('B20.95 — should handle 1000+ items without error', () => {
    const videos = Array.from({ length: 1000 }, (_, i) => ({
      id: `v${i}`, title: `Video ${i} banana`, category: { name: `Cat ${i % 10}` },
    }));
    const menus = Array.from({ length: 500 }, (_, i) => ({
      id: `m${i}`, title: `Menu ${i} banana`, category: { name: `Cat ${i % 10}` },
    }));
    videosSignal.set(videos);
    menusSignal.set(menus);
    detect();

    component.onSearchChange('banana');
    expect(component.searchSuggestions.length).toBe(1500);
  });

  it('B20.97 — effects should rebuild only the changed index', () => {
    videosSignal.set([{ id: '1', title: 'Video Banana', category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toEqual(['Video Banana']);

    // Only menus change — videos index should remain intact
    menusSignal.set([{ id: '2', title: 'Menu Banana', category: { name: 'Frutas' } }]);
    detect();
    component.onSearchChange('ban');
    expect(component.searchSuggestions).toContain('Video Banana');
    expect(component.searchSuggestions).toContain('Menu Banana');
  });
});
