import {LitElement} from 'lit';
import {vi} from 'vitest';
import {afterEach} from 'vitest';
import '../src/themes/coveo.css';
import '../src/utils/coveo.tw.css';
import '../src/utils/tailwind-utilities/utilities.tw.css';
import '../src/utils/tailwind.global.tw.css';
import {fixtureCleanup} from './testing-helpers/fixture-wrapper';

vi.mock('../src/components/common/interface/store', () => ({
  createAppLoadedListener: vi.fn(),
}));

vi.mock('../src/decorators/bind-state', () => ({
  bindStateToController: vi.fn(),
}));

vi.mock('../src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: (superClass: typeof LitElement) =>
    class extends superClass {},
  BindingController: class {},
}));

afterEach(async () => {
  fixtureCleanup();
});
