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

const slots = {
  LABEL: 'label',
  BADGES: 'badges',
  ACTIONS: 'actions',
  DATE: 'date',
  VISUAL: 'visual',
  TITLE: 'title',
  METADATA: 'metadata',
  EMPHASIZED: 'emphasized',
  EXCERPT: 'excerpt',
  BOTTOM_METADATA: 'bottom-metadata',
  CHILDREN: 'children',
};

describe('c-quantic-result-template', () => {
  afterEach(() => {
    cleanup();
  });

  it('should display all slots by default', async () => {
    const element = createTestComponent();
    await flushPromises();

    for (const [key, name] of Object.entries(slots)) {
      let slot = element.shadowRoot.querySelectorAll(
        selectors.slotByName(name)
      );
      expect(slot).not.toBeNull();
      expect(slot.length).toBe(1);

      const newElem = document.createElement('div');
      newElem.setAttribute('slot', name);
      newElem.innerText = key;
      element.shadowRoot.appendChild(newElem);

      slot = element.shadowRoot.querySelectorAll(selectors.slotByName(name));
      expect(slot).not.toBeNull();
      expect(slot.length).toBe(1);
    }
  });
});
