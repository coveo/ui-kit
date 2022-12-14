import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {render} from '@testing-library/react';
import App from './App';

let errorSpy: jest.SpyInstance;

beforeEach(() => {
  errorSpy = jest.spyOn(global.console, 'error');
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
