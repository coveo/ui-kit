import {initializeBindings, resultContext} from '@coveo/atomic';
import {buildSearchBox} from '@coveo/headless';
import './load-atomic.js';
import './nav.js';
import {searchCredentials} from './sample-credentials.js';

/**
 * Custom component driven by a Headless controller, showing how a consumer reaches
 * the surrounding interface's engine through `initializeBindings`.
 */
class CustomComponent extends HTMLElement {
  constructor() {
    super();
    this.initialize();
  }

  get template() {
    const template = document.createElement('template');
    template.innerHTML = '<input type="text" placeholder="Search as you type" />';
    return template;
  }

  async initialize() {
    const bindings = await initializeBindings(this);

    const shadowRoot = this.attachShadow({mode: 'closed'});
    shadowRoot.appendChild(this.template.content.cloneNode(true));

    const searchBox = buildSearchBox(bindings.engine);
    const input = shadowRoot.querySelector('input');
    input.addEventListener('input', () => {
      searchBox.updateText(input.value);
      searchBox.submit();
    });
  }
}

/**
 * Custom component inside a result template, showing how a consumer reads the
 * result it is rendered for through `resultContext`.
 */
class CustomTemplateComponent extends HTMLElement {
  initialized = false;

  connectedCallback() {
    if (this.initialized) {
      return;
    }

    this.initialize();
    this.initialized = true;
  }

  template(result) {
    const label = this.getAttribute('label');
    const template = document.createElement('template');
    template.innerHTML = `<p>${label}: ${result.title}</p>`;
    return template;
  }

  async initialize() {
    const result = await resultContext(this);
    const shadowRoot = this.attachShadow({mode: 'closed'});
    shadowRoot.appendChild(this.template(result).content.cloneNode(true));
  }
}

if (!customElements.get('custom-component')) {
  customElements.define('custom-component', CustomComponent);
}
if (!customElements.get('custom-template-component')) {
  customElements.define('custom-template-component', CustomTemplateComponent);
}

await customElements.whenDefined('atomic-search-interface');

const searchInterface = document.querySelector('atomic-search-interface');
await searchInterface.initialize(searchCredentials);
searchInterface.executeFirstSearch();
