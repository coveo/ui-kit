import {afterEach} from 'vitest';
import {fixtureCleanup} from './testing-helpers/fixture-wrapper';

afterEach(async () => {
  document.adoptedStyleSheets = [];
  fixtureCleanup();
});
