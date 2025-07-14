import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderQueryErrorTitle} from './title';

describe('#renderQueryErrorTitle', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorTitle({
        props: {
          i18n,
          organizationId: 'test-org',
          errorType: 'Disconnected',
          ...overrides,
        },
      })}`
    );

    return {
      title: element.querySelector('p[part="title"]'),
    };
  };

  it('should render the title with correct part', async () => {
    const {title} = await renderComponent();

    expect(title).toHaveAttribute('part', 'title');
  });

  it('should render Disconnected error title when errorType is Disconnected', async () => {
    const {title} = await renderComponent({
      errorType: 'Disconnected',
    });

    expect(title).toHaveTextContent('No access.');
  });

  it('should render NoEndpointsException error title when errorType is NoEndpointsException', async () => {
    const {title} = await renderComponent({
      errorType: 'NoEndpointsException',
    });

    expect(title).toHaveTextContent(
      'Your organization test-org has no available content.'
    );
  });

  it('should render InvalidTokenException error title when errorType is InvalidTokenException', async () => {
    const {title} = await renderComponent({
      errorType: 'InvalidTokenException',
    });

    expect(title).toHaveTextContent(
      'Your organization test-org cannot be accessed.'
    );
  });

  it('should render OrganizationIsPausedException error title when errorType is OrganizationIsPausedException', async () => {
    const {title} = await renderComponent({
      errorType: 'OrganizationIsPausedException',
      organizationId: 'test-org',
    });

    expect(title).toHaveTextContent(
      'Your organization test-org is paused due to inactivity and search is currently unavailable.'
    );
  });

  it('should render default error title when errorType is unknown', async () => {
    const {title} = await renderComponent({
      errorType: 'UnknownError',
    });

    expect(title).toHaveTextContent('Something went wrong');
  });
});
