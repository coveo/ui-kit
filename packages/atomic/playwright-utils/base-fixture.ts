/* eslint-disable @cspell/spellchecker */
import AxeBuilder from '@axe-core/playwright';
import type {APIResponse, Request, Route} from '@playwright/test';
import {test as base} from '@playwright/test';
import {createHash} from 'crypto';
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'fs';
import {join} from 'path';

export type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
export const makeAxeBuilder: Parameters<
  typeof base.extend<AxeFixture>
>[0]['makeAxeBuilder'] = async ({page}, use) => {
  const makeAxeBuilder = () =>
    new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('#code-root');

  await use(makeAxeBuilder);
};

const cacheFilePath = './playwright/.cache/';

function hashRequest(url: string, body: string | null) {
  const str = url + body;
  return createHash('sha512').update(str).digest('hex');
}

const cache = async (key: string, response: APIResponse) => {
  mkdirSync(cacheFilePath, {recursive: true});
  const body = await response.text();
  // TODO: check if the file already exists and throw
  writeFileSync(join(cacheFilePath, key), body);
  return body;
};

const handler = async (route: Route, request: Request) => {
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

base.beforeEach(async ({page}) => {
  await page.route(/commerce\/v2\/search/, handler);
});

base.afterEach(async ({page}) => {
  await page.unrouteAll({behavior: 'wait'});
});

export {base};
