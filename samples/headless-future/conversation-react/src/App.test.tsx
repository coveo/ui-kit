import {render} from '@testing-library/react';
import {beforeEach, expect, test, vi} from 'vitest';
import App from './App.js';

beforeEach(() => {
  vi.stubEnv('VITE_COVEO_ORGANIZATION_ID', 'my-org');
  vi.stubEnv('VITE_COVEO_ACCESS_TOKEN', 'my-token');
  vi.stubEnv('VITE_COVEO_TRACKING_ID', 'sample-tracking-id');
  vi.stubEnv('VITE_COVEO_LANGUAGE', 'en');
  vi.stubEnv('VITE_COVEO_COUNTRY', 'US');
  vi.stubEnv('VITE_COVEO_CURRENCY', 'USD');
});

test('renders initialized sample metadata', () => {
  const {getByText} = render(<App />);

  expect(getByText('Headless Future Conversation Sample')).toBeTruthy();
  expect(getByText('organizationId: my-org')).toBeTruthy();
});
