import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CabecalhoComponent } from './components/cabecalho/cabecalho.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [
    RouterOutlet,     // ✅ necessário para <router-outlet>
    CabecalhoComponent // ✅ necessário para <app-cabecalho>
  ],
})
export class App {}
