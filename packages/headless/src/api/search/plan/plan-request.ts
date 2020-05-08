import {OrganizationRequestParams} from '../search-request';

export interface PlanRequestParams extends OrganizationRequestParams {
  /**
   * The basic query expression.
   */
  q: string;
  /**
   * The unique identifier of the target Coveo Cloud organization.
   */
  organizationId: string;
}
