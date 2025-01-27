import {AtomicHostedUI} from './atomic-hosted-ui.js';

export * from './atomic-hosted-ui.js';
export default AtomicHostedUI;

declare global {
  interface HTMLElementTagNameMap {
    'atomic-hosted-ui': AtomicHostedUI;
  }
}
