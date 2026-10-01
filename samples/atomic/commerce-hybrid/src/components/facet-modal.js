/**
 * Opens whatever it wraps inside a native `<dialog>`.
 *
 * This is the third option, between customizing an Atomic component and replacing
 * it with Headless: the requirement is about the surrounding UI, so the Atomic
 * component inside is untouched. `atomic-commerce-facets` keeps its own state,
 * analytics, and styling, and does not know it is in a dialog.
 *
 * Two things make this work, both worth knowing before reaching for Headless:
 *
 * 1. Atomic components find their interface with `closest()`, so the wrapped
 *    component must stay inside `atomic-commerce-interface` in the DOM. That is
 *    the real constraint on composing around Atomic, and it rules out moving the
 *    markup into a portal at the end of `<body>`. A `<dialog>` is a good fit
 *    precisely because `showModal()` promotes it to the top layer visually while
 *    leaving it where it is in the DOM.
 * 2. The component is never re-created, only shown and hidden, so selections made
 *    in the dialog are already applied to the page behind it.
 */
class FacetModal extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') ?? 'Filters';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'facet-modal__trigger';
    trigger.textContent = label;

    const dialog = document.createElement('dialog');
    dialog.className = 'facet-modal__dialog';
    dialog.setAttribute('aria-label', label);

    const header = document.createElement('div');
    header.className = 'facet-modal__header';

    const title = document.createElement('h2');
    title.textContent = label;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'facet-modal__close';
    close.textContent = 'Done';
    close.addEventListener('click', () => dialog.close());

    header.append(title, close);

    // Move the wrapped content into the dialog once, at setup. It stays there for
    // the lifetime of the page, so it remains a descendant of the commerce
    // interface and is initialized exactly once.
    dialog.append(header, ...this.childNodes);

    // `showModal` provides focus trapping, Escape-to-close, an inert background,
    // and `aria-modal` semantics, which is most of what a hand-rolled modal would
    // have to reimplement.
    trigger.addEventListener('click', () => dialog.showModal());

    this.append(trigger, dialog);
  }
}

customElements.define('facet-modal', FacetModal);
