export const waitForAsyncUpdates = async () => {
  // Wait for React to flush all pending updates
  await new Promise((resolve) => setTimeout(resolve, 0));
  // Wait for microtasks
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};
