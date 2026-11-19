import { Component, inject, signal, computed, viewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { PushService } from '../../services/push.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-portal',
  imports: [RouterLink, FormsModule],
  templateUrl: './portal.html',
  styleUrl: './portal.css'
})
export class Portal {
  private articleService = inject(ArticleService);
  pushService = inject(PushService);

  dialogRef = viewChild<ElementRef<HTMLDialogElement>>('articleDialog');

  // Estados reativos da interface
  menuOpen = signal(false);
  searchOpen = signal(false);
  searchQuery = signal('');
  activeFilter = signal('');
  selectedArticle = signal<Article | null>(null);

  // Data atual no topo e ano no rodapé
  todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  currentYear = new Date().getFullYear();

  // Lista filtrada automaticamente sempre que busca, filtro ou artigos mudarem
  filteredArticles = computed(() => {
    const filter = this.activeFilter().toLowerCase();
    const q = this.searchQuery().trim().toLowerCase();

    return this.articleService.articles().filter(a => {
      const matchesCategory = !filter || a.category.toLowerCase().includes(filter);
      const matchesQuery =
        !q || [a.title, a.excerpt, a.category, a.body].join(' ').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  });

  filterBy(category: string): void {
    this.activeFilter.set(category);
    this.searchQuery.set('');
    setTimeout(() => {
      document.getElementById('ultimas')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  triggerSearch(): void {
    this.activeFilter.set('');
    document.getElementById('ultimas')?.scrollIntoView({ behavior: 'smooth' });
  }

  openArticle(article: Article): void {
    this.selectedArticle.set(article);
    this.dialogRef()?.nativeElement.showModal();
  }

  closeArticle(): void {
    this.dialogRef()?.nativeElement.close();
    this.selectedArticle.set(null);
  }
}