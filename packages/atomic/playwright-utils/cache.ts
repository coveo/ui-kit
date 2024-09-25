import {APIResponse, Request, Route} from '@playwright/test';
import {createHash} from 'crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

export const cacheFilePath = './playwright/.cache/';

export const hashRequest = (url: string, body: string | null) => {
  const str = url + body;
  return createHash('sha512').update(str).digest('hex');
};

export const cache = async (key: string, response: APIResponse) => {
  mkdirSync(cacheFilePath, {recursive: true});
  const body = await response.text();
  // TODO: check if the file already exists and throw
  writeFileSync(join(cacheFilePath, key), body);
  return body;
};

export const cacheHandler = async (route: Route, request: Request) => {
  console.log('intercepted ---', request.url());
  const {clientId, ...rest} = request.postDataJSON();
  const key = hashRequest(request.url(), JSON.stringify(rest));
  const cachedFile = join(cacheFilePath, key);

  if (existsSync(cachedFile)) {
    console.log('---reading from cache');
    await route.fulfill({
      body: readFileSync(cachedFile, 'utf8'),
    });
  } else {
    console.log('---fetching from network');
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: await cache(key, response),
    });
  }
};
