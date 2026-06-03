import type {i18n} from 'i18next';
import {html, type TemplateResult} from 'lit';

export const renderRefineModalBody =
  (i18n: i18n) =>
  (children: TemplateResult): TemplateResult =>
    html`
      <aside
        part="content"
        slot="body"
        class="flex w-full flex-col"
        aria-label=${i18n.t('refine-modal-content')}
      >
        ${children}
      </aside>
    `;
