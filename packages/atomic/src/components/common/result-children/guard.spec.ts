import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderResultChildrenGuard} from './guard';

describe('#renderResultChildrenGuard', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderResultChildrenGuard({
        props: {
          inheritTemplates: false,
          resultTemplateRegistered: true,
          templateHasError: false,
          ...overrides,
        },
      })(html`<span>Test</span>`)}`
    );

    return {
      element,
      slot: element.querySelector('slot'),
    };
  };

  it('should render nothing when #inheritTemplates is false and #resultTemplateRegistered is false', async () => {
    const {element} = await renderComponent({
      inheritTemplates: false,
      resultTemplateRegistered: false,
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render slot when #inheritTemplates is false and #templateHasError is true', async () => {
    const {slot} = await renderComponent({
      inheritTemplates: false,
      resultTemplateRegistered: true,
      templateHasError: true,
    });

    expect(slot).toBeInTheDocument();
  });

  it('should render children when #inheritTemplates is true', async () => {
    const {element} = await renderComponent({
      inheritTemplates: true,
      resultTemplateRegistered: false,
      templateHasError: false,
    });

    expect(element).toContainHTML('<span>Test</span>');
  });

  it('should render children when #resultTemplateRegistered is true and #templateHasError is false', async () => {
    const {element} = await renderComponent({
      inheritTemplates: false,
      resultTemplateRegistered: true,
      templateHasError: false,
    });

    expect(element).toContainHTML('<span>Test</span>');
  });

  it('should render children when both #inheritTemplates and #resultTemplateRegistered are true', async () => {
    const {element} = await renderComponent({
      inheritTemplates: true,
      resultTemplateRegistered: true,
      templateHasError: false,
    });

    expect(element).toContainHTML('<span>Test</span>');
  });
});
