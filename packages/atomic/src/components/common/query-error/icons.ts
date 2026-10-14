import CannotAccess from '../../../images/cannot-access.svg';
import Indexing from '../../../images/indexing.svg';
import SearchInactive from '../../../images/search-inactive.svg';
import SomethingWrong from '../../../images/something-wrong.svg';
import type {KnownErrorType} from './known-error-types';

/**
 * These query error illustrations weigh about 63 KB together. This module is only imported once an
 * error is rendered, so pages that never hit an error do not download them.
 */
export function getQueryErrorIcon(errorType?: string) {
  switch (errorType as KnownErrorType) {
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
