import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderQueryErrorLink} from './link';

describe('#renderQueryErrorLink', () => {
  let i18n: i18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (errorType?: string) => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorLink({props: {errorType, i18n}})}`
    );

    return {
      link: element.querySelector('a[part="doc-link"]'),
    };
  };

  it('should render the link with the "doc-link" part', async () => {
    const {link} = await renderComponent('NoEndpointsException');

    expect(link).toHaveAttribute('part', 'doc-link');
  });

  it('should render the link with the proper text', async () => {
    const {link} = await renderComponent('NoEndpointsException');

    expect(link).not.toBeNull();
    expect(link).toHaveTextContent('Coveo Online Help');
  });

  it('should render link with correct href when errorType is NoEndpointsException', async () => {
    const {link} = await renderComponent('NoEndpointsException');

    expect(link).toHaveAttribute('href', 'https://docs.coveo.com/en/mcc80216');
  });

  it('should render link with correct href when errorType is InvalidTokenException', async () => {
    const {link} = await renderComponent('InvalidTokenException');

    expect(link).toHaveAttribute('href', 'https://docs.coveo.com/en/102');
  });

  it('should render link with correct href when errorType is OrganizationIsPausedException', async () => {
    const {link} = await renderComponent('OrganizationIsPausedException');

    expect(link).toHaveAttribute('href', 'https://docs.coveo.com/en/1684');
  });

  it('should not render link when errorType is undefined', async () => {
    const {link} = await renderComponent();

    expect(link).toBeNull();
  });

  it('should not render link when errorType is unknown', async () => {
    const {link} = await renderComponent('UnknownErrorType');

    expect(link).toBeNull();
  });

  it('should not render link when errorType is empty string', async () => {
    const {link} = await renderComponent('');

    expect(link).toBeNull();
  });
});
