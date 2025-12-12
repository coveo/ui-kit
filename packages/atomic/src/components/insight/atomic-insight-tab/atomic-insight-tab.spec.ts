import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicInsightTab} from './atomic-insight-tab';
import './atomic-insight-tab';

describe('atomic-insight-tab', () => {
  const renderTab = async ({
    label = 'Test Tab',
    expression = 'test-expression',
    active = false,
  } = {}) => {
    const element = await fixture<AtomicInsightTab>(html`
      <atomic-insight-tab
        label="${label}"
        expression="${expression}"
        ?active="${active}"
      ></atomic-insight-tab>
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
        expression: '@source==MySource',
        active: true,
      });
      expect(element).toBeInTheDocument();
    });

    it('should reflect label property to attribute', async () => {
      const {element} = await renderTab({label: 'Custom Label'});
      expect(element.getAttribute('label')).toBe('Custom Label');
    });

    it('should reflect active property to attribute', async () => {
      const {element} = await renderTab({active: true});
      expect(element.hasAttribute('active')).toBe(true);
    });

    it('should have default label when not specified', async () => {
      const element = await fixture<AtomicInsightTab>(html`
        <atomic-insight-tab expression="test"></atomic-insight-tab>
      `);
      expect(element.label).toBe('no-label');
    });

    it('should have active false by default', async () => {
      const {element} = await renderTab();
      expect(element.active).toBe(false);
    });

    it('should allow updating properties', async () => {
      const {element} = await renderTab();
      element.label = 'Updated Label';
      element.active = true;
      await element.updateComplete;
      expect(element.label).toBe('Updated Label');
      expect(element.active).toBe(true);
    });
  });
});
