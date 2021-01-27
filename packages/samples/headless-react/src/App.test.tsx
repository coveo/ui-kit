import {render} from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const page = render(<App />);
  const logo = page.getByAltText('logo');
  expect(logo).toBeTruthy();
});
