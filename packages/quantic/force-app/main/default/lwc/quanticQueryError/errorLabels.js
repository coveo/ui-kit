import coveoDocsLink from '@salesforce/label/c.quantic_CoveoDocsLink';
import disconnectedDesc from '@salesforce/label/c.quantic_DisconnectedDesc';
import disconnectedTitle from '@salesforce/label/c.quantic_DisconnectedTitle';
import genericErrorDesc from '@salesforce/label/c.quantic_GenericErrorDesc';
import genericErrorTitle from '@salesforce/label/c.quantic_GenericErrorTitle';
import invalidTokenDesc from '@salesforce/label/c.quantic_InvalidTokenDesc';
import invalidTokenTitle from '@salesforce/label/c.quantic_InvalidTokenTitle';
import noEndpointsDesc from '@salesforce/label/c.quantic_NoEndpointsDesc';
import noEndpointsTitle from '@salesforce/label/c.quantic_NoEndpointsTitle';
import organisationPausedLink from '@salesforce/label/c.quantic_OrganisationPausedLink';
import organizationIsPausedDesc from '@salesforce/label/c.quantic_OrganizationIsPausedDesc';
import organizationIsPausedTitle from '@salesforce/label/c.quantic_OrganizationIsPausedTitle';

export const errorMap = {
  DisconnectedException: {
    title: disconnectedTitle,
    description: disconnectedDesc,
    link: null,
  },

  NoEndpointsException: {
    title: noEndpointsTitle,
    description: noEndpointsDesc,
    link: coveoDocsLink,
  },

  InvalidTokenException: {
    title: invalidTokenTitle,
    description: invalidTokenDesc,
    link: coveoDocsLink,
  },

  OrganizationIsPausedException: {
    title: organizationIsPausedTitle,
    description: organizationIsPausedDesc,
    link: organisationPausedLink,
  },
};
export const genericError = {
  title: genericErrorTitle,
  description: genericErrorDesc,
};
