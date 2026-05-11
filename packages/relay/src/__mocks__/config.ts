import {vi} from 'vitest';
import type {ConfigManager, RelayConfig} from '../config/config.js';

export function createMockConfig(config?: Partial<RelayConfig>): RelayConfig {
  return {
    url: 'https://platform.cloud.coveo.com',
    token: 'I am token',
    trackingId: 'website',
    ...config,
  };
}

export function createMockConfigManager(
  manager?: Partial<ConfigManager>
): ConfigManager {
  return {
    get: () => createMockConfig(),
    update: () => vi.fn(),
    ...manager,
  };
}
