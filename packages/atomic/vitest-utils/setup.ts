import {beforeEach} from 'vitest';
import '../src/themes/coveo.css';
import '../src/utils/coveo.tw.css';
import '../src/utils/tailwind-utilities/utilities.tw.css';
import '../src/utils/tailwind.global.tw.css';
import {fixtureCleanup} from './testing-helpers/fixture-wrapper.js';

(window.litIssuedWarnings as unknown) ??= new Set();
(window.litIssuedWarnings as unknown as Set<string>).add('dev-mode');

beforeEach(async () => {
  document.adoptedStyleSheets = [];
  fixtureCleanup();
});
