import {equal, notEqual} from 'node:assert';
import {fork} from 'node:child_process';
import {resolve} from 'node:path';
import {after, before, describe, it} from 'node:test';
import {launch} from 'puppeteer';

describe('CSP Smoketest', () => {
  let serverProcess;
  let browser;
  before(async () => {
    browser = await launch({headless: process.env.CI === 'true'});
    serverProcess = fork(resolve(import.meta.dirname, 'server.mjs'));
    await new Promise((resolve) => serverProcess.on('message', resolve));
  });

  after(async () => {
    serverProcess.kill();
    await browser.close();
  });

  it('should load the csp-ready page without errors', async () => {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (consoleMessage) => {
      if (consoleMessage.type() === 'error') {
        errors.push(consoleMessage);
      }
    });
    await page.goto('http://localhost:3000/examples/csp.html');
    await page.waitForNetworkIdle({waitForNetworkIdle: 1000});
    equal(errors.length, 0, 'No errors should be thrown on the page');
  });

  it('should load the non-csp-ready page with errors', async () => {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (consoleMessage) => {
      if (consoleMessage.type() === 'error') {
        errors.push(consoleMessage);
      }
    });
    await page.goto('http://localhost:3000/index.html');
    await page.waitForNetworkIdle({waitForNetworkIdle: 1000});
    notEqual(errors.length, 0, 'Errors should be thrown on the page');
  });
});
