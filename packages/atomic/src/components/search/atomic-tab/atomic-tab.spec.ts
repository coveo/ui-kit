import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicTab} from './atomic-tab';
import './atomic-tab';

describe('atomic-tab', () => {
  const renderTab = async ({
    label = 'Test Tab',
    name = 'test-tab',
    expression = '',
  } = {}) => {
    const element = await fixture<AtomicTab>(html`
      <atomic-tab
        label="${label}"
        name="${name}"
        expression="${expression}"
      ></atomic-tab>
    `);

    return {element};
  };

  describe('when rendering with valid props', () => {
    it('should render successfully with required props', async () => {
      const {element} = await renderTab();
      expect(element).toBeInTheDocument();
    });

    it('should render successfully with all props', async () => {
      const {element} = await renderTab({
        label: 'My Tab',
        name: 'my-tab',
        expression: '@source==MySource',
      });
      expect(element).toBeInTheDocument();
    });

    it('should reflect label property to attribute', async () => {
      const {element} = await renderTab({label: 'Custom Label'});
      expect(element.getAttribute('label')).toBe('Custom Label');
    });

    it('should reflect name property to attribute', async () => {
      const {element} = await renderTab({name: 'custom-name'});
      expect(element.getAttribute('name')).toBe('custom-name');
    });

    it('should reflect expression property to attribute', async () => {
      const {element} = await renderTab({expression: '@source==Test'});
      expect(element.getAttribute('expression')).toBe('@source==Test');
    });

    it('should have empty expression by default', async () => {
      const {element} = await renderTab();
      expect(element.expression).toBe('');
    });

    it('should allow updating properties', async () => {
      const {element} = await renderTab();

      element.label = 'Updated Label';
      element.name = 'updated-name';
      element.expression = '@updated==true';
      await element.updateComplete;

      expect(element.label).toBe('Updated Label');
      expect(element.name).toBe('updated-name');
      expect(element.expression).toBe('@updated==true');
    });
  });

  describe('when rendering slots', () => {
    it('should render default slot content', async () => {
      const element = await fixture<AtomicTab>(html`
        <atomic-tab label="Test" name="test">
          <div id="slot-content">Slot Content</div>
        </atomic-tab>
      `);

      const slotContent = element.querySelector('#slot-content');
      expect(slotContent).toBeInTheDocument();
      expect(slotContent?.textContent).toBe('Slot Content');
    });
  });
});
