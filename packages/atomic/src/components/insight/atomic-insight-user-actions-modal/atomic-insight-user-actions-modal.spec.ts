import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import type {AtomicInsightUserActionsModal} from './atomic-insight-user-actions-modal';
import './atomic-insight-user-actions-modal';

describe('atomic-insight-user-actions-modal', () => {
  const defaultUserId = 'user123';
  const defaultTicketCreationDateTime = '2024-01-01T00:00:00Z';

  const renderModal = async ({
    props = {},
  }: {
    props?: Partial<{
      openButton: HTMLElement;
      isOpen: boolean;
      userId: string;
      ticketCreationDateTime: string;
      excludedCustomActions: string[];
    }>;
  } = {}) => {
    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightUserActionsModal>({
        template: html`<atomic-insight-user-actions-modal
        .openButton=${props.openButton}
        ?is-open=${props.isOpen ?? false}
        user-id=${props.userId ?? defaultUserId}
        ticket-creation-date-time=${props.ticketCreationDateTime ?? defaultTicketCreationDateTime}
        .excludedCustomActions=${props.excludedCustomActions ?? []}
      ></atomic-insight-user-actions-modal>`,
        selector: 'atomic-insight-user-actions-modal',
      });

    return {
      element,
      get modal() {
        return element.shadowRoot?.querySelector('atomic-modal');
      },
      get timeline() {
        return element.shadowRoot?.querySelector(
          'atomic-insight-user-actions-timeline'
        );
      },
      parts: (el: AtomicInsightUserActionsModal) => ({
        title: el.shadowRoot?.querySelector('[part="title"]'),
        closeButton: el.shadowRoot?.querySelector('[part="close-button"]'),
        closeIcon: el.shadowRoot?.querySelector('[part="close-icon"]'),
      }),
    };
  };

  describe('#render', () => {
    it('should set fullscreen attribute on atomic-modal', async () => {
      const {modal} = await renderModal();
      expect(modal?.hasAttribute('fullscreen')).toBe(true);
    });

    it('should pass isOpen to atomic-modal', async () => {
      const {modal} = await renderModal({props: {isOpen: true}});
      expect(modal?.isOpen).toBe(true);
    });

    it('should pass openButton to atomic-modal as source', async () => {
      const sourceElement = document.createElement('button');
      const {modal} = await renderModal({props: {openButton: sourceElement}});
      expect(modal?.source).toBe(sourceElement);
    });

    it('should pass modal element itself as container to atomic-modal', async () => {
      const {element, modal} = await renderModal();
      expect(modal?.container).toBe(element);
    });

    it('should pass interface element as scope to atomic-modal', async () => {
      const {element, modal} = await renderModal();
      expect(modal?.scope).toBe(element.bindings.interfaceElement);
    });

    it('should render modal header with title', async () => {
      const {parts, element} = await renderModal();
      const title = parts(element).title;
      expect(title).toBeTruthy();
      expect(title?.textContent?.trim()).toBe(
        element.bindings.i18n.t('user-actions')
      );
    });

    it('should render close button with close icon', async () => {
      const {parts, element} = await renderModal();
      const closeButton = parts(element).closeButton;
      const closeIcon = parts(element).closeIcon;
      expect(closeButton).toBeTruthy();
      expect(closeIcon).toBeTruthy();
    });

    it('should render atomic-insight-user-actions-timeline with userId', async () => {
      const {timeline} = await renderModal({props: {userId: 'test-user'}});
      expect(timeline?.userId).toBe('test-user');
    });

    it('should render atomic-insight-user-actions-timeline with ticketCreationDateTime', async () => {
      const {timeline} = await renderModal({
        props: {ticketCreationDateTime: '2024-02-01T00:00:00Z'},
      });
      expect(timeline?.ticketCreationDateTime).toBe('2024-02-01T00:00:00Z');
    });

    it('should render atomic-insight-user-actions-timeline with excludedCustomActions', async () => {
      const {timeline} = await renderModal({
        props: {excludedCustomActions: ['action1', 'action2']},
      });
      expect(timeline?.excludedCustomActions).toEqual(['action1', 'action2']);
    });

    it('should render body with aria-label', async () => {
      const {element} = await renderModal();
      const body = element.shadowRoot?.querySelector('aside[slot="body"]');
      expect(body?.getAttribute('aria-label')).toBe(
        element.bindings.i18n.t('user-actions-content')
      );
    });
  });

  it('should set isOpen to false when close button is clicked', async () => {
    const {element, parts} = await renderModal({props: {isOpen: true}});
    const closeButton = parts(element).closeButton as HTMLButtonElement;

    closeButton?.click();
    await element.updateComplete;

    expect(element.isOpen).toBe(false);
  });

  it('should set isOpen to false when modal close is called', async () => {
    const {element, modal} = await renderModal({props: {isOpen: true}});

    modal?.close();
    await element.updateComplete;

    expect(element.isOpen).toBe(false);
  });

  describe('when isOpen changes', () => {
    it('should reflect isOpen attribute in DOM when true', async () => {
      const {element} = await renderModal({props: {isOpen: true}});
      expect(element.hasAttribute('is-open')).toBe(true);
    });

    it('should not reflect isOpen attribute in DOM when false', async () => {
      const {element} = await renderModal({props: {isOpen: false}});
      expect(element.hasAttribute('is-open')).toBe(false);
    });

    it('should update isOpen attribute when property changes', async () => {
      const {element} = await renderModal({props: {isOpen: false}});

      element.isOpen = true;
      await element.updateComplete;
      expect(element.hasAttribute('is-open')).toBe(true);

      element.isOpen = false;
      await element.updateComplete;
      expect(element.hasAttribute('is-open')).toBe(false);
    });
  });
});
