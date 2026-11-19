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

  onSubmit(): void {
    if (!this.title.trim() || !this.excerpt.trim() || !this.body.trim()) return;

    this.articleService.addArticle({
      title: this.title.trim(),
      excerpt: this.excerpt.trim(),
      category: this.category,
      image: this.image.trim(),
      body: this.body.trim()
    });

    this.resetForm();
    this.toast.show('Matéria salva neste navegador. Volte ao portal para visualizar.');
  }

  resetForm(): void {
    this.title = '';
    this.excerpt = '';
    this.category = 'Bahia';
    this.image = '';
    this.body = '';
  }

  onDelete(id: string): void {
    if (confirm('Excluir esta matéria deste navegador?')) {
      this.articleService.deleteArticle(id);
      this.toast.show('Matéria excluída deste navegador.');
    }
  }
}