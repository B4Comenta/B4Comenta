import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<string>('');
  readonly visible = signal<boolean>(false);
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(msg: string): void {
    this.message.set(msg);
    this.visible.set(true);
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.visible.set(false), 2400);
  }
}