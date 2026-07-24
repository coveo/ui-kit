import {Injectable} from '@angular/core';
import {Engine} from '@coveo/thermidor';
import {environment} from '../../environments/environment';
import {VISITOR_ID_COOKIE} from '../constants';

@Injectable({providedIn: 'root'})
export class EngineService {
  readonly engine: Engine;

  constructor() {
    this.engine = new Engine({
      configuration: this.buildConfiguration(),
      navigatorContextProvider: () => ({
        clientId: this.getOrCreateVisitorId() ?? '',
        location: window.location.href,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent || null,
      }),
    });
  }

  private buildConfiguration() {
    const endpoint = environment.endpoint || window.location.origin;

    return {
      organizationId: environment.organizationId,
      accessToken: environment.accessToken,
      trackingId: environment.trackingId,
      language: environment.language,
      country: environment.country,
      currency: environment.currency,
      endpoint,
    };
  }

  private getOrCreateVisitorId(): string | undefined {
    try {
      const existing = this.getCookie(VISITOR_ID_COOKIE);
      if (existing) return existing;

      const id = crypto.randomUUID();
      this.setCookie(VISITOR_ID_COOKIE, id);
      return id;
    } catch {
      return undefined;
    }
  }

  private getCookie(name: string): string | undefined {
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
    return match?.split('=')[1];
  }

  private setCookie(name: string, value: string): void {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  }
}
