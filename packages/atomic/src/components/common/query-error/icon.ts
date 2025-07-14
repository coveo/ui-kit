import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CannotAccess from '../../../images/cannot-access.svg';
import Indexing from '../../../images/indexing.svg';
import NoConnection from '../../../images/no-connection.svg';
import SearchInactive from '../../../images/search-inactive.svg';
import SomethingWrong from '../../../images/something-wrong.svg';
import '../../common/atomic-icon/atomic-icon';
import type {KnownErrorType} from './known-error-types';

interface QueryErrorIconProps {
  errorType?: string;
}

export const renderQueryErrorIcon: FunctionalComponent<QueryErrorIconProps> = ({
  props,
}) => {
  const getIconFromErrorType = () => {
    switch (props.errorType as KnownErrorType) {
      case 'Disconnected':
        return NoConnection;

      case 'NoEndpointsException':
        return Indexing;

      case 'InvalidTokenException':
        return CannotAccess;
      case 'OrganizationIsPausedException':
        return SearchInactive;
      default:
        return SomethingWrong;
    }
  };

  return html`<atomic-icon
    part="icon"
    icon=${getIconFromErrorType()}
    class="w-1/2 max-w-lg"
  ></atomic-icon>`;
};
