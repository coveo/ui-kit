import disconnectedTitle from '@salesforce/label/c.quantic_DisconnectedTitle';
import noEndpointsTitle from '@salesforce/label/c.quantic_NoEndpointsTitle';
import invalidTokenTitle from '@salesforce/label/c.quantic_InvalidTokenTitle';
import organizationIsPausedTitle from '@salesforce/label/c.quantic_OrganizationIsPausedTitle';
import genericErrorTitle from '@salesforce/label/c.quantic_GenericErrorTitle';
import disconnectedDesc from '@salesforce/label/c.quantic_DisconnectedDesc';
import noEndpointsDesc from '@salesforce/label/c.quantic_NoEndpointsDesc';
import invalidTokenDesc from '@salesforce/label/c.quantic_InvalidTokenDesc';
import organizationIsPausedDesc from '@salesforce/label/c.quantic_OrganizationIsPausedDesc';
import genericErrorDesc from '@salesforce/label/c.quantic_GenericErrorDesc';
import coveoDocsLink from '@salesforce/label/c.quantic_CoveoDocsLink';
import organisationPausedLink from '@salesforce/label/c.quantic_OrganisationPausedLink';

export const ErrorMap = [ 
    {
        "disconnectedException":  {
            title: disconnectedTitle,
            description: disconnectedDesc,
            link: null
        }
    },
    {
        "noEndpointsException": {
            title: noEndpointsTitle,
            description: noEndpointsDesc,
            link: coveoDocsLink
        }
    },
    {
        "invalidTokenException": {
            title: invalidTokenTitle,
            description: invalidTokenDesc,
            link: coveoDocsLink  
        }
    },
    {
        "organizationIsPausedException" : {
            title: organizationIsPausedTitle,
            description: organizationIsPausedDesc,
            link: organisationPausedLink 
        },
    }
]
export const genericError = {
    title: genericErrorTitle,
    description: genericErrorDesc,
}
