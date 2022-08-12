export interface DebouncedQueueOptions {
  delay: number;
}

export interface DebouncedQueue {
  enqueue(execute: () => void, uniqueId?: string): void;
  clear(): void;
  cancelActionIfQueued(id: string): void;
}

interface QueuedAction {
  id?: string;
  execute: () => void;
}

export function buildDebouncedQueue(
  options: DebouncedQueueOptions
): DebouncedQueue {
  let actions: QueuedAction[] = [];
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function dequeueAction() {
    const action = actions.shift();
    if (action) {
      action.execute();
    } else {
      clearInterval(intervalId!);
      intervalId = null;
    }
  }

  function cancelActionIfQueued(id: string) {
    actions = actions.filter((action) => action.id !== id);
  }

  return {
    enqueue(execute: () => void, uniqueId?: string) {
      if (uniqueId) {
        cancelActionIfQueued(uniqueId);
      }
      actions.push({id: uniqueId, execute});
      if (intervalId === null) {
        dequeueAction();
        intervalId = setInterval(dequeueAction, options.delay);
      }
    },
    clear() {
      actions = [];
    },
    cancelActionIfQueued,
  };
}
