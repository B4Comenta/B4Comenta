import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private readonly VAPID_PUBLIC_KEY = 'BMFzjdxyqVxe5gIPi6YUc_9wttI9hpuH0JAZo7yJIOSWbkWNpsbNxgCOud1Um9OGebdGpLtNa6lELs92SYbzAm0';

  async subscribe(): Promise<void> {
    if (!this.swPush.isEnabled) {
      this.toast.show('Notificações Push ativas apenas na versão publicada (build).');
      return;
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      await firstValueFrom(this.http.post('/api/subscribe', sub));
      this.toast.show('Notificações do B4 Comenta ativadas!');
    } catch {
      this.toast.show('Não foi possível ativar as notificações.');
    }
  }
}