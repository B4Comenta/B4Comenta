import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  articleService = inject(ArticleService);
  private toast = inject(ToastService);

  categories = ['Bahia', 'Vitória', 'Nordeste', 'Brasil', 'Mercado da bola', 'Opinião'];

  title = '';
  excerpt = '';
  category = 'Bahia';
  image = '';
  body = '';
  isSubmitting = false;

  async onSubmit(): Promise<void> {
    if (!this.title.trim() || !this.excerpt.trim() || !this.body.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    try {
      await this.articleService.addArticle({
        title: this.title.trim(),
        excerpt: this.excerpt.trim(),
        category: this.category,
        image: this.image.trim(),
        body: this.body.trim()
      });

      this.resetForm();
      this.toast.show('Matéria publicada na nuvem e notificação enviada!');
    } catch (err: any) {
      const msg = err?.error?.error || 'Erro ao publicar matéria no servidor.';
      this.toast.show(msg);
      console.error('Falha ao publicar:', err);
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm(): void {
    this.title = '';
    this.excerpt = '';
    this.category = 'Bahia';
    this.image = '';
    this.body = '';
  }

  async onDelete(id: string): Promise<void> {
    if (confirm('Excluir esta matéria do portal?')) {
      try {
        await this.articleService.deleteArticle(id);
        this.toast.show('Matéria excluída.');
      } catch {
        this.toast.show('Erro ao excluir matéria.');
      }
    }
  }
}