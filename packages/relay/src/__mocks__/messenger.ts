import { vi } from "vitest";

const createExplorerMessenger = () => {
  const sendMessage = () => vi.fn();
  return { sendMessage };
};

module.exports = {
  createExplorerMessenger,
};
