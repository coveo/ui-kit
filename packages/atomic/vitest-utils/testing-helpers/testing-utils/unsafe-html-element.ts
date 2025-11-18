import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {html, render} from 'lit-html';

export function unsafeHTMLElement(
  raw: string,
  doc: Document = document
): HTMLElement {
  const container = doc.createElement('div');
  const template = html`${unsafeHTML(raw)}`;
  render(template, container);
  return container.firstElementChild as HTMLElement;
}
