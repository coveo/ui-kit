import {beforeEach, describe, expect, it} from 'vitest';
import {createEditInGithubElement} from './create-edit-in-github-element.js';

describe('create-edit-in-github-element', () => {
  describe('#createEditInGithubElement', () => {
    let element: ReturnType<typeof createEditInGithubElement>;

    beforeEach(() => {
      element = createEditInGithubElement();
    });

    it('should return a div with the container class', () => {
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('atomic-edit-github-container');
    });

    it('should contain an anchor element with the link class', () => {
      const anchor = element.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor!.className).toBe('atomic-edit-github-link');
    });

    it('should set target="_blank" and rel="noopener noreferrer" on the anchor', () => {
      const anchor = element.querySelector('a')!;
      expect(anchor.target).toBe('_blank');
      expect(anchor.rel).toBe('noopener noreferrer');
    });

    it('should set aria-label="Edit in GitHub" on the anchor', () => {
      const anchor = element.querySelector('a')!;
      expect(anchor.getAttribute('aria-label')).toBe('Edit in GitHub');
    });

    it('should contain an SVG with aria-hidden="true"', () => {
      const svg = element.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg!.getAttribute('aria-hidden')).toBe('true');
    });

    it('should contain a label span with "Edit in GitHub" text', () => {
      const label = element.querySelector('.atomic-edit-github-label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toBe('Edit in GitHub');
    });

    it('should expose the _anchor property pointing to the inner anchor', () => {
      const anchor = element.querySelector('a')!;
      expect(element._anchor).toBe(anchor);
    });

    describe('href proxy', () => {
      it('should forward a set value to the inner anchor', () => {
        element.href = 'https://github.com/coveo/ui-kit';
        expect(element.querySelector('a')!.href).toBe(
          'https://github.com/coveo/ui-kit'
        );
      });

      it('should read back the value from the inner anchor', () => {
        element.querySelector('a')!.href = 'https://example.com';
        expect(element.href).toBe('https://example.com/');
      });

      it('should clear the anchor href when set to undefined', () => {
        element.href = 'https://github.com/coveo/ui-kit';
        element.href = undefined;
        expect(element.querySelector('a')!.getAttribute('href')).toBe('');
      });
    });
  });
});
