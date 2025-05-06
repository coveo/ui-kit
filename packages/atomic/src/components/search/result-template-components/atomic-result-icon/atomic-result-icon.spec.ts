import {describe, it} from 'vitest';

describe('AtomicResultIcon', () => {
  describe('when not used inside a result template', () => {
    it.todo('should remove itself');
    it.todo('should log an error');
  });
  describe('when the rendered result has a known filetype', () => {
    it.todo('should render the icon of the filetype');
    it.todo('should be accessible');
  });
  describe('when the rendered result has no known filetype and a known objecttype', () => {
    it.todo('should render the icon of the objecttype');
    it.todo('should be accessible');
  });
  describe('when the rendered result has no known filetype or objecttype', () => {
    it.todo('should render a generic icon');
    it.todo('should be accessible');
  });
});
