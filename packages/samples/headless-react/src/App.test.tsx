import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {render} from '@testing-library/react';
import {vi, SpyInstance} from 'vitest';
import App from './App';

let errorSpy: SpyInstance<
  [message?: unknown, ...optionalParams: unknown[]],
  void
>;

beforeEach(() => {
  errorSpy = vi.spyOn(global.console, 'error');
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
