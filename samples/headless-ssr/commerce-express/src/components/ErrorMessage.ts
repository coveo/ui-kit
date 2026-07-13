import {escapeHtml} from '../common/utils.js';

export function ErrorMessage(message?: string): string {
  if (!message) return '';
  return `
    <div id="query-error" class="ErrorMessage">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}
