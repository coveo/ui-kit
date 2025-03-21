'use server';

import {cookies} from 'next/headers';

const recentQueriesCookieKey = 'atomic-ssr-recent-queries';

/**
 * Fetch recent queries from cookies.
 * If the cookie does not exist, return an empty array.
 */
export async function getRecentQueries(): Promise<string[]> {
  const cookieStore = cookies();
  const recentQueries = cookieStore.get(recentQueriesCookieKey)?.value;
  return recentQueries ? JSON.parse(recentQueries) : [];
}

/**
 * Store recent queries in cookies.
 * This will overwrite the existing cookie with the new queries.
 */
export async function updateRecentQueries(queries: string[]): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(recentQueriesCookieKey, JSON.stringify(queries), {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
}
