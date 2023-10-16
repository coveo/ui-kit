import { ListenerManager } from "../listener/listener";

export function createMockListenerManager(
  config: Partial<ListenerManager> = {}
): ListenerManager {
  return {
    add: jest.fn(),
    call: jest.fn(),
    remove: jest.fn(),
    ...config,
  };
}
