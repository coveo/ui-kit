import type {ReactiveControllerHost} from 'lit';

interface ErrorHolder {
  error?: Error;
}

/**
 * Displays the error of the first invalid child on its parent. Use it for light DOM children that the parent reads
 * but does not slot, so a box on the child would never show.
 *
 * It re-checks after each child update, keeps the child's error as `cause`, never replaces an error the parent already
 * holds, and clears only the error it set. Setting the parent's error does not update the children, so it cannot loop.
 * The children are a fixed snapshot: a child added later is not watched, and the watchers stay on the children.
 *
 * @param parent - The component that displays the error.
 * @param children - The children to watch. Only upgraded elements can be watched.
 * @param childName - The tag name of the children, used in the error message.
 */
export function displayChildErrors(
  parent: ErrorHolder,
  children: (ReactiveControllerHost & ErrorHolder)[],
  childName: string
) {
  let displayedError: Error | undefined;

  const sync = () => {
    const childError = children.find((child) => child.error)?.error;
    if (displayedError?.cause === childError && parent.error === displayedError) {
      return;
    }
    if (parent.error && parent.error !== displayedError) {
      return;
    }
    displayedError = childError
      ? new Error(`An "${childName}" child is invalid: ${childError.message}`, {cause: childError})
      : undefined;
    parent.error = displayedError;
  };

  for (const child of children) {
    child.addController({hostUpdated: sync});
  }
  sync();
}
