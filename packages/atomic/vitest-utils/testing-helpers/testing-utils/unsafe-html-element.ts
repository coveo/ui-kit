import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {html, render} from 'lit-html';

export function unsafeHTMLElement(
  raw: string,
  doc: Document = document
): HTMLElement {
  const container = doc.createElement('div');
  const template = html`${unsafeHTML(raw)}`;
  render(template, container);
  const element = container.firstElementChild as HTMLElement | null;
  if (!element) {
    throw new Error('Failed to create element from HTML string');
  }
  return element;
}
