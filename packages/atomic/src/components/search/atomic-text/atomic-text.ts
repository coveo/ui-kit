import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('atomic-text')
export class AtomicText extends LitElement {
  render() {
    const config = getSampleSearchEngineConfiguration();
    return html`<p>${config.organizationId}</p>`;
  }
}
