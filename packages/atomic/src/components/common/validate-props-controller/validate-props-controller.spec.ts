import {Schema, StringValue} from '@coveo/bueno';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {LitElementWithError} from '@/src/decorators/types';
import {deepEqual} from '@/src/utils/compare-utils';
import {ValidatePropsController} from './validate-props-controller';

vi.mock('@/src/utils/compare-utils', {spy: true});

@customElement('test-element')
class TestElement extends LitElement implements LitElementWithError {
  @state() error!: Error;
}

describe('ValidatePropsController', () => {
  let mockElement: TestElement;
  let mockGetProps: ReturnType<typeof vi.fn>;
  let mockSchema: Schema<{name: string}>;
  let controller: ValidatePropsController<{name: string}>;

  beforeEach(() => {
    mockElement = new TestElement();
    mockGetProps = vi.fn();
    mockSchema = new Schema({
      name: new StringValue({constrainTo: ['valid', 'also-valid']}),
    });

    vi.spyOn(mockElement, 'addController');

    controller = new ValidatePropsController(
      mockElement,
      mockGetProps,
      mockSchema
    );
  });

  it('should register itself as a controller with the host', () => {
    expect(mockElement.addController).toHaveBeenCalledExactlyOnceWith(
      controller
    );
  });

  describe('when no logger is provided', () => {
    describe('when the host is connected to the DOM', () => {
      it('should validate the props', () => {
        const schemaSpy = vi.spyOn(mockSchema, 'validate');
        const props = {name: 'valid'};
        mockGetProps.mockReturnValue(props);

        controller.hostConnected();

        expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);
      });

      it('should set the error on the host when validation throws', () => {
        mockGetProps.mockReturnValue({name: 'invalid-value'});

        controller.hostConnected();

        expect(mockElement.error).toBeDefined();
        expect(mockElement.error).toBeInstanceOf(Error);
      });

      it('should not set the error on the host when validation does not throw', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        expect(mockElement.error).toBeUndefined();
      });
    });

    describe('when the host is about to update', () => {
      it('should verify whether the props have changed with #deepEqual', () => {
        const props = {name: 'valid'};
        mockGetProps.mockReturnValue(props);

        controller.hostConnected();

        const newProps = {name: 'also-valid'};
        mockGetProps.mockReturnValue(newProps);

        controller.hostUpdate();

        expect(vi.mocked(deepEqual)).toHaveBeenCalledExactlyOnceWith(
          newProps,
          props
        );
      });

      it('should not revalidate when the props have not changed', () => {
        const schemaSpy = vi.spyOn(mockSchema, 'validate');
        const props = {name: 'valid'};
        mockGetProps.mockReturnValue(props);

        controller.hostConnected();
        expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);

        schemaSpy.mockClear();

        controller.hostUpdate();

        expect(schemaSpy).not.toHaveBeenCalled();
      });

      describe('when the props have changed', () => {
        it('should clear any existing error on the host', () => {
          mockGetProps.mockReturnValue({name: 'invalid'});

          controller.hostConnected();

          expect(mockElement.error).toBeInstanceOf(Error);

          const newProps = {name: 'valid'};
          mockGetProps.mockReturnValue(newProps);

          controller.hostUpdate();

          expect(mockElement.error).toBeUndefined();
        });

        it('should revalidate the props', () => {
          const schemaSpy = vi.spyOn(mockSchema, 'validate');
          const props = {name: 'valid'};
          mockGetProps.mockReturnValue(props);

          controller.hostConnected();
          expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);

          schemaSpy.mockClear();

          const newProps = {name: 'also-valid'};
          mockGetProps.mockReturnValue(newProps);

          controller.hostUpdate();

          expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(newProps);
        });

        it('should set the error on the host when revalidation throws', () => {
          mockGetProps.mockReturnValue({name: 'valid'});

          controller.hostConnected();

          expect(mockElement.error).toBeUndefined();

          mockGetProps.mockReturnValue({name: 'invalid'});

          controller.hostUpdate();

          expect(mockElement.error).toBeInstanceOf(Error);
        });

        it('should not set the error on the host when revalidation does not throw', () => {
          mockGetProps.mockReturnValue({name: 'valid'});

          controller.hostConnected();

          expect(mockElement.error).toBeUndefined();

          mockGetProps.mockReturnValue({name: 'also-valid'});

          controller.hostUpdate();

          expect(mockElement.error).toBeUndefined();
        });
      });
    });
  });

  describe('when a logger is provided', () => {
    let mockLogger: {warn: ReturnType<typeof vi.fn>};
    let mockGetLogger: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockLogger = {warn: vi.fn()};
      mockGetLogger = vi.fn().mockReturnValue(mockLogger);

      controller = new ValidatePropsController(
        mockElement,
        mockGetProps,
        mockSchema,
        mockGetLogger
      );
    });

    describe('when the host is connected to the DOM', () => {
      it('should log a warning when validation throws', () => {
        mockGetProps.mockReturnValue({name: 'invalid-value'});

        controller.hostConnected();

        expect(mockLogger.warn).toHaveBeenCalledOnce();
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('name')
        );
      });

      it('should not set the error on the host when validation throws', () => {
        mockGetProps.mockReturnValue({name: 'invalid-value'});

        controller.hostConnected();

        expect(mockElement.error).toBeUndefined();
      });

      it('should not log a warning when validation does not throw', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        expect(mockLogger.warn).not.toHaveBeenCalled();
      });
    });

    describe('when the host is about to update', () => {
      it('should log a warning when revalidation throws', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        mockGetProps.mockReturnValue({name: 'invalid'});

        controller.hostUpdate();

        expect(mockLogger.warn).toHaveBeenCalledOnce();
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('name')
        );
      });

      it('should not set the error on the host when revalidation throws', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        expect(mockElement.error).toBeUndefined();

        mockGetProps.mockReturnValue({name: 'invalid'});

        controller.hostUpdate();

        expect(mockElement.error).toBeUndefined();
      });
    });

    describe('when the logger function returns undefined', () => {
      beforeEach(() => {
        mockGetLogger.mockReturnValue(undefined);

        controller = new ValidatePropsController(
          mockElement,
          mockGetProps,
          mockSchema,
          mockGetLogger
        );
      });

      it('should set the error on the host when validation throws', () => {
        mockGetProps.mockReturnValue({name: 'invalid-value'});

        controller.hostConnected();

        expect(mockElement.error).toBeDefined();
        expect(mockElement.error).toBeInstanceOf(Error);
      });
    });
  });
});
