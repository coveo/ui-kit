import {beforeEach} from 'vitest';
import {fixtureCleanup} from './testing-helpers/fixture-wrapper';

beforeEach(async () => {
  document.adoptedStyleSheets = [];
  fixtureCleanup();
});
