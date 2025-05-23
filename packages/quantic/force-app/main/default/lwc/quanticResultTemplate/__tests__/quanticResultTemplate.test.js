// @ts-ignore
import QuanticResultTemplate from '../quanticResultTemplate';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

const createTestComponent = buildCreateTestComponent(
  QuanticResultTemplate,
  'c-quantic-result-template'
);

const selectors = {
  slotByName: (name) => `slot[name="${name}"]`,
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

    for (const name of previewSlots.concat(otherSlots)) {
      let slot = element.shadowRoot.querySelectorAll(
        selectors.slotByName(name)
      );
      expect(slot).not.toBeNull();
      expect(slot.length).toBe(1);
    }
  });

  describe('with isAnyPreviewOpen set to true', () => {
    it('should display only the slots that are set to true', async () => {
      const element = createTestComponent({
        isAnyPreviewOpen: true,
      });
      await flushPromises();

      for (const name of previewSlots) {
        let slot = element.shadowRoot.querySelectorAll(
          selectors.slotByName(name)
        );
        expect(slot).not.toBeNull();
        expect(slot.length).toBe(1);
        expect(slot[0].parentElement.ariaHidden).toBe('true');
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
        element.shadowRoot.querySelector(selectors.slotByName('actions'))
          .parentElement.ariaHidden
      ).toBe('true');
    });
  });

  describe('with hideBorder set to true', () => {
    it('should set the hideBorder class', async () => {
      const element = createTestComponent({
        hideBorder: true,
      });
      await flushPromises();
      expect(element.shadowRoot.firstChild.className).toBe(
        'lgc-bg slds-p-vertical_medium'
      );
    });
  });
});
