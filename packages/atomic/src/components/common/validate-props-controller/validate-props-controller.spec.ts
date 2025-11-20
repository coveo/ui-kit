import {Schema, StringValue} from '@coveo/bueno';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';
import {deepEqual} from '@/src/utils/compare-utils';
import {ValidatePropsController} from './validate-props-controller';

vi.mock('@/src/utils/compare-utils', {spy: true});

@customElement('test-element')
class TestElement extends LitElement {
  @state() error?: Error;
}

describe('ValidatePropsController', () => {
  let mockElement: TestElement;
  let mockGetProps: MockedFunction<() => {name: string}>;
  let mockSchema: Schema<{name: string}>;
  let controller: ValidatePropsController<{name: string}>;
  let consoleWarnSpy: MockedFunction<typeof console.warn>;

  beforeEach(() => {
    mockElement = new TestElement();
    mockGetProps = vi.fn();
    mockSchema = new Schema({
      name: new StringValue({constrainTo: ['valid', 'also-valid']}),
    });
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.spyOn(mockElement, 'addController');
  });

  describe('when throwOnError is true (default behavior)', () => {
    beforeEach(() => {
      controller = new ValidatePropsController(
        mockElement as TestElement & HTMLElement & {error: Error},
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

      it('should set error on host when validation fails', () => {
        mockGetProps.mockReturnValue({name: 'invalid-value'});

        controller.hostConnected();

        expect(mockElement.error).toBeInstanceOf(Error);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should not set error when validation passes', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        expect(mockElement.error).toBeUndefined();
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

        it('should set error when revalidation fails', () => {
          mockGetProps.mockReturnValue({name: 'valid'});

          controller.hostConnected();

          mockGetProps.mockReturnValue({name: 'invalid'});

          controller.hostUpdate();

          expect(mockElement.error).toBeInstanceOf(Error);
          expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should clear error when revalidation passes', () => {
          mockGetProps.mockReturnValue({name: 'invalid'});

          controller.hostConnected();
          expect(mockElement.error).toBeInstanceOf(Error);

          mockGetProps.mockReturnValue({name: 'valid'});

          controller.hostUpdate();

          expect(mockElement.error).toBeUndefined();
        });
      });
    });
  });

  describe('when throwOnError is false (warning mode)', () => {
    beforeEach(() => {
      controller = new ValidatePropsController(
        mockElement as TestElement & HTMLElement & {error: Error},
        mockGetProps,
        mockSchema,
        false
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

      it('should log warning to console when validation fails', () => {
        mockGetProps.mockReturnValue({name: 'invalid-value'});

        controller.hostConnected();

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Prop validation failed for component test-element'
          ),
          mockElement
        );
        expect(mockElement.error).toBeUndefined();
      });

      it('should not log warning when validation passes', () => {
        mockGetProps.mockReturnValue({name: 'valid'});

        controller.hostConnected();

        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(mockElement.error).toBeUndefined();
      });
    });

    describe('when the host is about to update', () => {
      describe('when the props have changed', () => {
        it('should log warning when revalidation fails', () => {
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
          expect(mockElement.error).toBeUndefined();
        });

        it('should not log warning when revalidation passes', () => {
          mockGetProps.mockReturnValue({name: 'valid'});

          controller.hostConnected();

          consoleWarnSpy.mockClear();

          mockGetProps.mockReturnValue({name: 'also-valid'});

          controller.hostUpdate();

          expect(consoleWarnSpy).not.toHaveBeenCalled();
          expect(mockElement.error).toBeUndefined();
        });
      });
    });
  });
});
