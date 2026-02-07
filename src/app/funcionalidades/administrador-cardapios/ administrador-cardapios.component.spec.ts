import { TestBed } from '@angular/core/testing';
import { AdministradorCardapiosComponent } from './administrador-cardapios.component';
import { CardapioService } from '../../compartilhado/servicos/cardapio/cardapio-service';



describe('AdministradorCardapiosComponent', () => {
  let addSpy: jasmine.Spy;

  beforeEach(async () => {
    addSpy = jasmine.createSpy('add');

    await TestBed.configureTestingModule({
      imports: [ ],
      declarations: [AdministradorCardapiosComponent],
      providers: [{ provide: CardapioService, useValue: { add: addSpy } }],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(AdministradorCardapiosComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('não deve salvar se o formulário estiver inválido', () => {
    const fixture = TestBed.createComponent(AdministradorCardapiosComponent);
    const component = fixture.componentInstance;

    component.form.patchValue({
      title: '',
      description: '',
    });

    component.salvar();
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('deve chamar add quando o formulário estiver válido', () => {
    const fixture = TestBed.createComponent(AdministradorCardapiosComponent);
    const component = fixture.componentInstance;

    component.form.patchValue({
      title: 'Cardápio do Dia',
      description: 'Refeição saudável e simples',
      categoryName: 'Almoço',
      capa: 'https://example.com/capa.jpg',
      receita: 'Modo de preparo',
      dicasNutri: 'Dica da nutri',
      proteinas: 20,
      carboidratos: 30,
      gorduras: 10,
      fibras: 5,
      calorias: 350,
    });

    component.salvar();
    expect(addSpy).toHaveBeenCalled();
  });
});
