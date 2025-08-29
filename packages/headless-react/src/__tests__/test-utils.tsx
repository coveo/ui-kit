import {type RenderResult, render} from '@testing-library/react';
import type {PropsWithChildren, ReactElement} from 'react';

interface ProviderWrapperOptions {
  controllers?: unknown;
  engine?: unknown;
  // biome-ignore lint/suspicious/noExplicitAny: Provider types are complex and vary
  provider?: React.ComponentType<any>;
}

export function renderWithProvider(
  ui: ReactElement,
  options?: ProviderWrapperOptions
): RenderResult {
  return render(ui, {
    wrapper: createProviderWrapper(options),
  });
}

export const waitForAsyncUpdates = async () => {
  // Wait for React to flush all pending updates
  await new Promise((resolve) => setTimeout(resolve, 0));
  // Wait for microtasks
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

function createProviderWrapper(options?: ProviderWrapperOptions) {
  return function ProviderWrapper({children}: PropsWithChildren) {
    return options?.provider ? (
      <options.provider
        controllers={options?.controllers}
        engine={options?.engine}
      >
        {children}
      </options.provider>
    ) : (
      <> {children} </>
    );
  };
}
