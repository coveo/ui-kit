'use client';

import {buildProviderWithDefinition} from '@coveo/headless-react/ssr-next';
import {searchEngineDefinition, standaloneEngineDefinition} from '@/lib/react/engine';

// For pages whose static state holds the results of a search run on the server.
export const SearchProvider = buildProviderWithDefinition(searchEngineDefinition);

// For pages that run no search on the server, such as a home page with a standalone search box.
export const StandaloneProvider = buildProviderWithDefinition(standaloneEngineDefinition);
