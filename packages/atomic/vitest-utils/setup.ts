// setup.ts
import {afterEach} from 'vitest';
import {fixtureCleanup} from './testing-helpers/fixture-wrapper';

afterEach(async () => {
  fixtureCleanup();
});
