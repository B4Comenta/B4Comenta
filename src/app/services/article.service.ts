import { Injectable, signal, effect } from '@angular/core';
import { Article } from '../models/article.model';

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
  private readonly STORAGE_KEY = 'b4comenta_articles_v1';

  readonly articles = signal<Article[]>(this.loadFromStorage());

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.articles()));
    });
  }

  private loadFromStorage(): Article[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
    }
  }

  addArticle(data: Omit<Article, 'id' | 'tag' | 'date'>): void {
    const newArticle: Article = {
      ...data,
      id: 'b4-' + Date.now(),
      tag: data.category.toUpperCase(),
      date: new Date().toLocaleDateString('pt-BR')
    };
    this.articles.update(list => [newArticle, ...list]);
  }

  deleteArticle(id: string): void {
    this.articles.update(list => list.filter(a => a.id !== id));
  }
}