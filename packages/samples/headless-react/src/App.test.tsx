import {render} from '@testing-library/react';
import App from './App';

let errorSpy: jest.SpyInstance;

beforeEach(() => {
  errorSpy = jest.spyOn(global.console, 'error');
});

test('renders without error', () => {
  render(<App />);

  expect(errorSpy).not.toHaveBeenCalled();
});
