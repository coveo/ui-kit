import CannotAccess from '../../../images/cannot-access.svg';
import Indexing from '../../../images/indexing.svg';
import NoConnection from '../../../images/no-connection.svg';
import SearchInactive from '../../../images/search-inactive.svg';
import SomethingWrong from '../../../images/something-wrong.svg';
import type {KnownErrorType} from './known-error-types';

/**
 * The query error illustrations weigh about 80 KB together. This module is only
 * imported once an error is rendered, so pages that never hit an error do not
 * download them.
 */
export function getQueryErrorIcon(errorType?: string) {
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
}
