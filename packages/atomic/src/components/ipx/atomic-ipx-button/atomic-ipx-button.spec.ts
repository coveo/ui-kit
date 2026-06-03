import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicIpxButton} from './atomic-ipx-button';
import './atomic-ipx-button';

describe('atomic-ipx-button', () => {
  const renderButton = async ({
    label,
    closeIcon,
    openIcon,
  }: {
    label?: string;
    closeIcon?: string;
    openIcon?: string;
  } = {}) => {
    const element = await fixture<AtomicIpxButton>(html`
      <atomic-ipx-button
        .label=${label}
        .closeIcon=${closeIcon}
        .openIcon=${openIcon}
      ></atomic-ipx-button>
    `);

    return {
      element,
      parts: {
        container: element.shadowRoot?.querySelector('[part="container"]'),
        ipxButton: element.shadowRoot?.querySelector('[part="ipx-button"]'),
        buttonIcon: element.shadowRoot?.querySelector('[part="button-icon"]'),
        buttonText: element.shadowRoot?.querySelector('[part="button-text"]'),
        closeIcon: element.shadowRoot?.querySelector('[part="ipx-close-icon"]'),
        openIcon: element.shadowRoot?.querySelector('[part="ipx-open-icon"]'),
      },
    };
  };

  describe('when rendering with default props', () => {
    it('should render successfully', async () => {
      const {element} = await renderButton();
      expect(element).toBeInTheDocument();
    });

    it('should render the container part', async () => {
      const {parts} = await renderButton();
      expect(parts.container).toBeTruthy();
    });

    it('should render the button part', async () => {
      const {parts} = await renderButton();
      expect(parts.ipxButton).toBeTruthy();
    });

    it('should render the button icon container', async () => {
      const {parts} = await renderButton();
      expect(parts.buttonIcon).toBeTruthy();
    });

    it('should render the close icon', async () => {
      const {parts} = await renderButton();
      expect(parts.closeIcon).toBeTruthy();
    });

    it('should render the open icon', async () => {
      const {parts} = await renderButton();
      expect(parts.openIcon).toBeTruthy();
    });

    it('should have isModalOpen false by default', async () => {
      const {element} = await renderButton();
      expect(element.isModalOpen).toBe(false);
    });

    it('should not render button text when no label is provided', async () => {
      const {parts} = await renderButton();
      expect(parts.buttonText).toBeFalsy();
    });
  });

  describe('when rendering with a label', () => {
    it('should render the button text element', async () => {
      const {parts} = await renderButton({label: 'Search'});
      expect(parts.buttonText).toBeTruthy();
    });

    it('should display the correct label text', async () => {
      const {parts} = await renderButton({label: 'Search'});
      expect(parts.buttonText?.textContent).toBe('Search');
    });

    it('should reflect the label property to an attribute', async () => {
      const {element} = await renderButton({label: 'Help'});
      expect(element.getAttribute('label')).toBe('Help');
    });
  });

  describe('when rendering with custom icons', () => {
    const customSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="8"></circle></svg>';

    it('should accept a custom close icon', async () => {
      const {element} = await renderButton({closeIcon: customSvg});
      expect(element.closeIcon).toBe(customSvg);
    });

    it('should accept a custom open icon', async () => {
      const {element} = await renderButton({openIcon: customSvg});
      expect(element.openIcon).toBe(customSvg);
    });
  });

  describe('button accessibility', () => {
    it('should render a button element', async () => {
      const {element} = await renderButton();
      const button = element.shadowRoot?.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should have the button inside the ipx-button part', async () => {
      const {parts} = await renderButton();
      expect(parts.ipxButton?.tagName.toLowerCase()).toBe('button');
    });
  });
});
