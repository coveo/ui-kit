import {Schema, StringValue} from '@coveo/bueno';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {ValidatePropsController} from './validate-props-controller';

@customElement('test-element')
class TestElement extends LitElement implements LitElementWithError {
  @state() error!: Error;
}

describe('ValidatePropsController', () => {
  let mockElement: TestElement;
  let mockGetProps: ReturnType<typeof vi.fn>;
  let mockSchema: Schema<{name: string}>;
  let controller: ValidatePropsController;

  beforeEach(() => {
    mockElement = new TestElement();
    mockGetProps = vi.fn();
    mockSchema = new Schema({
      name: new StringValue({constrainTo: ['valid', 'also-valid']}),
    });

    vi.spyOn(mockElement, 'addController');

    controller = new ValidatePropsController(mockElement, {
      getProps: mockGetProps,
      schema: mockSchema,
    });
  });

  it('should register itself as a controller with the host', () => {
    expect(mockElement.addController).toHaveBeenCalledWith(controller);
  });

  describe('when host is connected', () => {
    it('should validate props', () => {
      const schemaSpy = vi.spyOn(mockSchema, 'validate');
      const props = {name: 'valid'};
      mockGetProps.mockReturnValue(props);

      controller.hostConnected();

      expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);
    });

    it('should set error on element when schema validation throws', () => {
      const validationError = new Error('Validation failed');
      vi.spyOn(mockSchema, 'validate').mockImplementation(() => {
        throw validationError;
      });
      mockGetProps.mockReturnValue({name: 'invalid'});

      controller.hostConnected();

      expect(mockElement.error).toBe(validationError);
    });

    it('should not set error on element when schema validation does not throw', () => {
      mockGetProps.mockReturnValue({name: 'valid'});

      controller.hostConnected();

      expect(mockElement.error).toBeUndefined();
    });
  });

  describe('when host updates', () => {
    it('should not revalidate when props have not changed', () => {
      const schemaSpy = vi.spyOn(mockSchema, 'validate');
      const props = {name: 'valid'};
      mockGetProps.mockReturnValue(props);

      controller.hostConnected();
      expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);

      schemaSpy.mockClear();

      controller.hostUpdate();

      expect(schemaSpy).not.toHaveBeenCalled();
    });

    it('should revalidate when props have changed', () => {
      const schemaSpy = vi.spyOn(mockSchema, 'validate');
      const props = {name: 'valid'};
      mockGetProps.mockReturnValue(props);

      controller.hostConnected();
      expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);

      schemaSpy.mockClear();

      const newProps = {name: 'also-valid'};
      mockGetProps.mockReturnValue({name: 'also-valid'});

      controller.hostUpdate();

      expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(newProps);
    });

    it('should set error on element when schema revalidation throws', () => {
      mockGetProps.mockReturnValue({name: 'valid'});

      controller.hostConnected();

      expect(mockElement.error).toBeUndefined();

      const validationError = new Error('Validation failed');
      vi.spyOn(mockSchema, 'validate').mockImplementation(() => {
        throw validationError;
      });
      mockGetProps.mockReturnValue({name: 'invalid'});

      controller.hostUpdate();

      expect(mockElement.error).toBe(validationError);
    });

    it('should not set error on element when schema revalidation does not throw', () => {
      mockGetProps.mockReturnValue({name: 'valid'});

      controller.hostConnected();

      expect(mockElement.error).toBeUndefined();

      mockGetProps.mockReturnValue({name: 'also-valid'});

      controller.hostUpdate();

      expect(mockElement.error).toBeUndefined();
    });
  });
});
