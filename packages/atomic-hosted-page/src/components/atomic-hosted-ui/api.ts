import {getOrganizationEndpoint} from '@coveo/headless';
import type {InitializationOptions} from './atomic-hosted-ui.js';

export async function getHostedPage(
  options: InitializationOptions,
  hostedType: 'trial' | 'builder' | 'code'
) {
  const platformUrl = getOrganizationEndpoint(
    options.organizationId,
    options.environment,
    'admin'
  );

  const paths = {
    builder: {
      pagePathPrefix: 'searchpage/v1/interfaces',
      pagePath: '/json',
    },
    trial: {
      pagePathPrefix: 'searchinterfaces',
      pagePath: '/hostedpage/v1',
    },
    code: {
      pagePathPrefix: 'hostedpages',
      pagePath: '',
    },
  } as const;

  const {pagePathPrefix, pagePath} = paths[hostedType];

  const pageResponse = await fetch(
    `${platformUrl}/rest/organizations/${options.organizationId}/${pagePathPrefix}/${options.pageId}${pagePath}`,
    {
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
      },
    }
  );

  return await pageResponse.json();
}
