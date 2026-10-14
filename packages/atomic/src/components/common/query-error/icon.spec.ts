import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import CannotAccess from '../../../images/cannot-access.svg';
import Indexing from '../../../images/indexing.svg';
import NoConnection from '../../../images/no-connection.svg';
import SearchInactive from '../../../images/search-inactive.svg';
import SomethingWrong from '../../../images/something-wrong.svg';
import {renderQueryErrorIcon} from './icon';

describe('#renderQueryErrorIcon', () => {
  const renderComponent = async (errorType?: string) => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorIcon({props: {errorType}})}`
    );

    return {
      atomicIcon: element.querySelector('atomic-icon'),
    };
  };

  const expectIcon = (atomicIcon: Element | null, icon: string) =>
    vi.waitFor(() => expect(atomicIcon).toHaveAttribute('icon', icon));

  it('should render atomic-icon with correct attributes', async () => {
    const {atomicIcon} = await renderComponent();

    expect(atomicIcon).toHaveAttribute('part', 'icon');
  });

  it('should render NoConnection icon when errorType is Disconnected', async () => {
    const {atomicIcon} = await renderComponent('Disconnected');

    await expectIcon(atomicIcon, NoConnection);
  });

  it('should render Indexing icon when errorType is NoEndpointsException', async () => {
    const {atomicIcon} = await renderComponent('NoEndpointsException');

    await expectIcon(atomicIcon, Indexing);
  });

  it('should render CannotAccess icon when errorType is InvalidTokenException', async () => {
    const {atomicIcon} = await renderComponent('InvalidTokenException');

    await expectIcon(atomicIcon, CannotAccess);
  });

  it('should render SearchInactive icon when errorType is OrganizationIsPausedException', async () => {
    const {atomicIcon} = await renderComponent('OrganizationIsPausedException');

    await expectIcon(atomicIcon, SearchInactive);
  });

  it('should render default icon when errorType is unknown', async () => {
    const {atomicIcon} = await renderComponent('UnknownErrorType');

    await expectIcon(atomicIcon, SomethingWrong);
  });
});
