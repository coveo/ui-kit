// @ts-ignore
import QuanticResultTemplate from '../quanticResultTemplate';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

const createTestComponent = buildCreateTestComponent(
  QuanticResultTemplate,
  'c-quantic-result-template'
);

const selectors = {
  slotByName: (name) => `slot[name="${name}"]`,
  container: (name) => `div[data-testid="${name}_container"]`,
};

const previewSlots = ['label', 'badges', 'date', 'visual'];
const otherSlots = [
  'actions',
  'title',
  'metadata',
  'emphasized',
  'excerpt',
  'bottom-metadata',
  'children',
];
const allSlots = previewSlots.concat(otherSlots);

describe('c-quantic-result-template', () => {
  afterEach(() => {
    cleanup();
  });

  it('should display all slots by default', async () => {
    const element = createTestComponent();
    await flushPromises();

    expect(element.shadowRoot.firstChild.className).toBe(
      'lgc-bg slds-p-vertical_medium slds-border_bottom'
    );

    for (const name of allSlots) {
      let slot = element.shadowRoot.querySelectorAll(
        selectors.slotByName(name)
      );
      expect(slot).not.toBeNull();
      expect(slot.length).toBe(1);
    }
  });

  describe('with isAnyPreviewOpen set to true', () => {
    it('should set aria-hidden to true on the result slots for screen readers', async () => {
      const element = createTestComponent({
        isAnyPreviewOpen: true,
      });
      await flushPromises();

      for (const name of previewSlots) {
        let container = element.shadowRoot.querySelector(
          selectors.container(name)
        );
        expect(container).not.toBeNull();
        expect(container.ariaHidden).toBe('true');
      }
    });
  });

  describe('with resultPreviewShouldNotBeAccessible set to true', () => {
    it('should hide the actions slot', async () => {
      const element = createTestComponent({
        resultPreviewShouldNotBeAccessible: true,
      });
      await flushPromises();
      expect(
        element.shadowRoot.querySelector(selectors.container('actions'))
          .ariaHidden
      ).toBe('true');
    });
  });

  describe('with hideBorder set to true', () => {
    it('should set the hideBorder class', async () => {
      const element = createTestComponent({
        hideBorder: true,
      });
      await flushPromises();
      expect(
        element.shadowRoot.firstChild.className.includes('slds-border_bottom')
      ).toBe(false);
    });
  });
});
