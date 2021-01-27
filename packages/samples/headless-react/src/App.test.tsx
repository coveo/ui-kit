import {render} from '@testing-library/react';
import App from './App';

test('renders react logo', () => {
  const page = render(<App />);
  const logo = page.getByAltText('logo');
  expect(logo).toBeTruthy();
});
