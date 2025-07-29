import { ListenerManager } from "../listener/listener.js";

export function createMockListenerManager(
  config: Partial<ListenerManager> = {},
): ListenerManager {
  return {
    add: jest.fn(),
    call: jest.fn(),
    remove: jest.fn(),
    ...config,
  };
}
