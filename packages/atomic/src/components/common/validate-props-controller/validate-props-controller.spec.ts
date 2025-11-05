import {Schema, StringValue} from '@coveo/bueno';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {deepEqual} from '@/src/utils/compare-utils';
import type {AnyBindings} from '../interface/bindings';
import {ValidatePropsController} from './validate-props-controller';

vi.mock('@/src/utils/compare-utils', {spy: true});

@customElement('test-element')
class TestElement extends LitElement {
  @state() bindings?: AnyBindings;
}

describe('ValidatePropsController', () => {
  let mockElement: TestElement;
  let mockGetProps: ReturnType<typeof vi.fn>;
  let mockSchema: Schema<{name: string}>;
  let controller: ValidatePropsController<{name: string}>;
  let mockLogger: {warn: ReturnType<typeof vi.fn>};
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockElement = new TestElement();
    mockGetProps = vi.fn();
    mockSchema = new Schema({
      name: new StringValue({constrainTo: ['valid', 'also-valid']}),
    });
    mockLogger = {warn: vi.fn()};
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

  describe('when the host is connected to the DOM', () => {
    it('should validate the props', () => {
      const schemaSpy = vi.spyOn(mockSchema, 'validate');
      const props = {name: 'valid'};
      mockGetProps.mockReturnValue(props);

      controller.hostConnected();

      expect(schemaSpy).toHaveBeenCalledExactlyOnceWith(props);
    });

    it('should log a warning to console when validation throws and no engine logger', () => {
      mockGetProps.mockReturnValue({name: 'invalid-value'});

      controller.hostConnected();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component test-element'
        ),
        mockElement
      );
    });

    it('should not log a warning when validation does not throw', () => {
      mockGetProps.mockReturnValue({name: 'valid'});

      controller.hostConnected();

      expect(consoleWarnSpy).not.toHaveBeenCalled();
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

      it('should log a warning when revalidation throws', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        mockGetProps.mockReturnValue({name: 'invalid'});

        controller.hostUpdate();

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Prop validation failed for component test-element'
          ),
          mockElement
        );
      });

      it('should not log a warning when revalidation does not throw', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        consoleWarnSpy.mockClear();

        mockGetProps.mockReturnValue({name: 'also-valid'});

        controller.hostUpdate();

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('when engine logger is available', () => {
    beforeEach(() => {
      mockElement.bindings = {
        engine: {logger: mockLogger},
      } as unknown as AnyBindings;
    });

    it('should use engine logger instead of console.warn', () => {
      mockGetProps.mockReturnValue({name: 'invalid-value'});

      controller.hostConnected();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component test-element'
        ),
        mockElement
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('when engine logger exists but warn method is not available', () => {
    beforeEach(() => {
      mockElement.bindings = {
        engine: {logger: {error: vi.fn()}},
      } as unknown as AnyBindings;
    });

    it('should fall back to console.warn', () => {
      mockGetProps.mockReturnValue({name: 'invalid-value'});

      controller.hostConnected();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component test-element'
        ),
        mockElement
      );
    });
  });
});
