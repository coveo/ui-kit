import {FunctionalComponent, h} from '@stencil/core';
import CannotAccess from '../../../images/cannot-access.svg';
import Indexing from '../../../images/indexing.svg';
import NoConnection from '../../../images/no-connection.svg';
import SearchInactive from '../../../images/search-inactive.svg';
import SomethingWrong from '../../../images/something-wrong.svg';
import {KnownErrorType} from './known-error-types';

interface QueryErrorIconProps {
  errorType?: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QueryErrorIcon: FunctionalComponent<QueryErrorIconProps> = ({
  errorType,
}) => {
  const getIconFromErrorType = () => {
    switch (errorType as KnownErrorType) {
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

  return (
    <atomic-icon
      part="icon"
      icon={getIconFromErrorType()}
      class="w-1/2 max-w-lg"
    ></atomic-icon>
  );
};
