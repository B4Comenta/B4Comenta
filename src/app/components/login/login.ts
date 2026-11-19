import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <form class="login-box" (ngSubmit)="entrar()">
        <span class="eyebrow"><i></i>ÁREA RESTRITA</span>
        <h2>ACESSO <em>ADMIN</em></h2>

        <input
          type="password"
          [(ngModel)]="senha"
          name="senha"
          placeholder="Digite a senha de administrador"
          required
        />

        @if (erro()) {
          <p class="erro">{{ erro() }}</p>
        }

        <button type="submit" class="button button-red" [disabled]="carregando()">
          {{ carregando() ? 'VERIFICANDO...' : 'ENTRAR NO PAINEL' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 80vh;
      display: grid;
      place-items: center;
      padding: 20px;
    }
    .login-box {
      background: #fff;
      border: 1px solid #dfe1e2;
      padding: 36px;
      width: min(400px, 100%);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .login-box h2 {
      font: 900 38px/0.95 var(--display);
      margin: 4px 0 8px;
    }
    .login-box h2 em {
      font-style: normal;
      color: var(--red);
    }
    .login-box input {
      padding: 13px;
      border: 1px solid #cdd0d3;
      font-size: 14px;
    }
    .erro {
      color: var(--red);
      font-size: 12px;
      font-weight: 700;
      margin: 0;
    }
    .login-box button {
      justify-content: center;
      cursor: pointer;
    }
  `]
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  senha = '';
  erro = signal('');
  carregando = signal(false);

  async entrar() {
    this.erro.set('');
    this.carregando.set(true);

    const sucesso = await this.auth.login(this.senha);
    this.carregando.set(false);

    if (sucesso) {
      this.router.navigate(['/admin']);
    } else {
      this.erro.set('Senha inválida.');
    }
  }
}