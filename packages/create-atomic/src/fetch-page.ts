import type {
  IManifestResponse,
  ISearchInterfaceConfigurationResponse,
  PlatformClient,
} from '@coveo/platform-client';

/**
 * @coveo/platform-client's IManifestResponse with simplified configuration
 */
export interface IManifest extends Omit<IManifestResponse<never>, 'config'> {
  config: Pick<ISearchInterfaceConfigurationResponse, 'name'>;
}

export async function fetchPageManifest(
  client: PlatformClient,
  pageId: string,
  type: 'next-gen' | 'legacy' | 'unknown'
) {
  const manifestGetters = [];
  if (type !== 'legacy') {
    manifestGetters.push(getNextGenManifest);
  }
  if (type !== 'next-gen') {
    manifestGetters.push(getLegacyManifest);
  }
  for (const manifestGetter of manifestGetters) {
    let manifest: IManifest;
    try {
      manifest = await manifestGetter(client, pageId);
    } catch (_) {
      continue;
    }
    return replaceResultsPlaceholder(manifest);
  }
  throw new Error('Could not fetch the page manifest');
}

function replaceResultsPlaceholder(manifestResponse: IManifest) {
  const resultManagerComponent = '<results-manager></results-manager>';
  if (manifestResponse.results.placeholder) {
    manifestResponse.markup = manifestResponse.markup.replace(
      manifestResponse.results.placeholder,
      resultManagerComponent
    );
  }

  return manifestResponse;
}

async function getLegacyManifest(
  client: PlatformClient,
  pageId: string
): Promise<IManifest> {
  return await client.searchInterfaces.manifest(pageId, {
    pagePlaceholders: {
      results: '--results--',
    },
  });
}

async function getNextGenManifest(
  client: PlatformClient,
  pageId: string
): Promise<IManifest> {
  return await client.nextGenSearchPages.manifest(pageId, {
    pagePlaceholders: {
      results: '--results--',
    },
  });
}
