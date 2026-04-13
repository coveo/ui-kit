import {Injectable} from '@angular/core';
import type {CommerceConfig} from '@core/config/env.js';

@Injectable({providedIn: 'root'})
export class ConfigService {
  getConfig(): CommerceConfig {
    const config = (window as any).__config__;

    if (!config) {
      throw new Error(
        'Configuration not loaded. Ensure config.json is available.'
      );
    }

    return config;
  }
}
