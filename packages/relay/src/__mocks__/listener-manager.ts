import { vi } from "vitest";
import { ListenerManager } from "../listener/listener.js";

export function createMockListenerManager(
  config: Partial<ListenerManager> = {},
): ListenerManager {
  return {
    add: vi.fn(),
    call: vi.fn(),
    remove: vi.fn(),
    ...config,
  };
}
