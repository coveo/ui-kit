import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {render} from '@testing-library/react';
import {beforeEach, expect, type MockInstance, test, vi} from 'vitest';
import App from './App';

let errorSpy: MockInstance;

beforeEach(() => {
  errorSpy = vi.spyOn(globalThis.console, 'error');
});

test('renders without error', async () => {
  const configuration = getSampleSearchEngineConfiguration();
  configuration.analytics = {
    enabled: false,
  };

  const engine = buildSearchEngine({
    configuration,
  });

  render(<App engine={engine} />);

  expect(errorSpy).not.toHaveBeenCalled();
});
