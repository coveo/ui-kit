import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderQueryErrorDescription} from './description';

describe('#renderQueryErrorDescription', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorDescription({
        props: {
          i18n,
          url: 'www.example.com',
          organizationId: 'test-org',
          errorType: 'Disconnected',
          ...overrides,
        },
      })}`
    );

    return {
      description: element.querySelector('p[part="description"]'),
    };
  };

  it('should render the description with correct part', async () => {
    const {description} = await renderComponent();

    expect(description).toHaveAttribute('part', 'description');
  });

  it('should render Disconnected error description when errorType is Disconnected', async () => {
    const {description} = await renderComponent({
      errorType: 'Disconnected',
      url: 'www.example.com',
    });

    expect(description).toHaveTextContent(
      "Your query couldn't be sent to the following URL: www.example.com. Verify your connection."
    );
  });

  it('should render NoEndpointsException error description when errorType is NoEndpointsException', async () => {
    const {description} = await renderComponent({
      errorType: 'NoEndpointsException',
    });

    expect(description).toHaveTextContent(
      'Add content sources or wait for your newly created sources to finish indexing.'
    );
  });

  it('should render InvalidTokenException error description when errorType is InvalidTokenException', async () => {
    const {description} = await renderComponent({
      errorType: 'InvalidTokenException',
    });

    expect(description).toHaveTextContent('Ensure that the token is valid.');
  });

  it('should render OrganizationIsPausedException error description when errorType is OrganizationIsPausedException', async () => {
    const {description} = await renderComponent({
      errorType: 'OrganizationIsPausedException',
      organizationId: 'test-org',
    });

    expect(description).toHaveTextContent(
      'Your organization is resuming and will be available shortly'
    );
  });

  it('should render default error description when errorType is unknown', async () => {
    const {description} = await renderComponent({
      errorType: 'UnknownError',
    });

    expect(description).toHaveTextContent(
      'If the problem persists contact the administrator.'
    );
  });
});
