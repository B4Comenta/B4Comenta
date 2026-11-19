import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  private swPush = inject(SwPush);
  private toast = inject(ToastService);

  // Substitua pela sua chave pública VAPID quando conectar o backend
  private readonly VAPID_PUBLIC_KEY = 'SUA_CHAVE_PUBLICA_VAPID_AQUI';

  async subscribe(): Promise<void> {
    if (!this.swPush.isEnabled) {
      this.toast.show('Notificações Push ativas apenas na versão publicada (build).');
      return;
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });
      console.log('PushSubscription gerada:', JSON.stringify(sub));
      this.toast.show('Notificações do B4 Comenta ativadas!');
    } catch {
      this.toast.show('Não foi possível ativar as notificações.');
    }
  }
}