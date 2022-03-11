import {createApp} from 'vue';
import App from './App.vue';
import * as components from './components/index.ts';

function kebabCase(str: string): string {
  if (str) {
    return str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .join('-')
      .toLowerCase();
  }
  return '';
}

const app = createApp(App);

Object.keys(components).forEach((name) => {
  const component = components[name];
  app.component(kebabCase(name), component);
});

app.mount('#app');
