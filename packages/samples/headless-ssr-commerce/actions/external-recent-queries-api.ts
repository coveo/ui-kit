'use server';

import {accessSync, readFileSync, writeFile, writeFileSync} from 'fs';
import path from 'path';

const recentQueriesFilePath = path.resolve('./recent-queries.json');

/**
 * Ensure the recent queries file exists.
 * If it doesn't exist, create it with an empty array.
 */
async function ensureFileExists(): Promise<void> {
  try {
    accessSync(recentQueriesFilePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      writeFileSync(
        recentQueriesFilePath,
        JSON.stringify([], null, 2),
        'utf-8'
      );
    } else {
      throw error;
    }
  }
}

/**
 * Fetch recent queries from the file system.
 * If the file does not exist, return an empty array.
 */
async function getRecentQueriesFromFile(): Promise<string[]> {
  try {
    await ensureFileExists();
    const data = readFileSync(recentQueriesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read recent queries from file', error);
    return [];
  }
}

/**
 * Store recent queries in the file system.
 * This will overwrite the file with the new queries.
 */
async function setRecentQueriesInFile(queries: string[]): Promise<void> {
  const data = JSON.stringify(queries, null, 2); // Pretty-print JSON
  await ensureFileExists();
  writeFile(recentQueriesFilePath, data, {encoding: 'utf-8'}, (error) => {
    if (error) {
      console.error('Failed to write recent queries to file', error);
    }
  });
}

/**
 * Public API to fetch recent queries.
 */
export async function getRecentQueries(): Promise<string[]> {
  return getRecentQueriesFromFile();
}

/**
 * Public API to update recent queries.
 */
export async function updateRecentQueries(queries: string[]): Promise<void> {
  await setRecentQueriesInFile([...queries]);
}

export async function clearRecentQueries(): Promise<void> {
  await setRecentQueriesInFile([]);
}
