import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Article } from '../models/article.model';
import { AuthService } from './auth.service';

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'demo-1',
    category: 'Bahia',
    tag: 'FUTEBOL BAIANO',
    title: 'O espaço do futebol baiano no debate esportivo',
    excerpt: 'Acompanhe notícias, análises e histórias que movimentam os clubes e as competições da Bahia.',
    date: 'Conteúdo demonstrativo',
    image: '',
    body: 'Este é um conteúdo demonstrativo para apresentar a estrutura editorial do B4 Comenta. Substitua este texto por uma matéria apurada, com informações verificadas, fontes identificadas e contexto jornalístico antes de publicar.'
  },
  {
    id: 'demo-2',
    category: 'Vitória',
    tag: 'ESPORTIVO',
    title: 'Vitória: informação para além dos 90 minutos',
    excerpt: 'Bastidores, desempenho e os assuntos que movimentam o cotidiano rubro-negro.',
    date: 'Conteúdo demonstrativo',
    image: '',
    body: 'Este é um conteúdo demonstrativo. Use o painel administrativo para cadastrar uma matéria real, incluindo título, linha fina, categoria, imagem e texto.'
  },
  {
    id: 'demo-3',
    category: 'Nordeste',
    tag: 'FUTEBOL NORDESTINO',
    title: 'O futebol nordestino merece estar no centro da conversa',
    excerpt: 'Clubes, torcidas e histórias de uma região que produz futebol dentro e fora de campo.',
    date: 'Conteúdo demonstrativo',
    image: '',
    body: 'Este é um conteúdo demonstrativo para a versão inicial do portal. O B4 Comenta pretende ampliar a cobertura do futebol nordestino com contexto e apuração.'
  },
  {
    id: 'demo-4',
    category: 'Opinião',
    tag: 'ANÁLISE',
    title: 'Opinião também precisa de informação',
    excerpt: 'Um espaço para análise, debate e interpretação dos acontecimentos do esporte.',
    date: 'Conteúdo demonstrativo',
    image: '',
    body: 'Este espaço é reservado a artigos de opinião. Diferencie claramente análise, opinião e notícia, e identifique autoria.'
  }
];

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly articles = signal<Article[]>(INITIAL_ARTICLES);

  constructor() {
    this.loadArticles();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('b4_admin_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async loadArticles(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Article[]>('/api/articles'));
      if (Array.isArray(data) && data.length > 0) {
        this.articles.set(data);
      }
    } catch (err) {
      console.error('Erro ao carregar matérias:', err);
    }
  }

  async addArticle(data: Omit<Article, 'id' | 'tag' | 'date'>): Promise<void> {
    const created = await firstValueFrom(
      this.http.post<Article>('/api/articles', data, { headers: this.getAuthHeaders() })
    );
    this.articles.update((list) => [
      created,
      ...list.filter((a) => !a.id.startsWith('demo-'))
    ]);
  }

  async deleteArticle(id: string): Promise<void> {
    if (!id.startsWith('demo-')) {
      await firstValueFrom(
        this.http.delete(`/api/articles?id=${encodeURIComponent(id)}`, {
          headers: this.getAuthHeaders()
        })
      );
    }
    this.articles.update((list) => list.filter((a) => a.id !== id));
  }
}