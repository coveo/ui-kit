import {buildContext} from '@coveo/headless';
import {engine} from '../../engine';

export function setContext(pageId: string) {
  buildContext(engine).set({
    pageId,
    application: 'my react app',
    applicationVersion: '1.0',
  });
}
