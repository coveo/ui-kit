import '@coveo/atomic/dist/atomic/themes/coveo.css';
import {applyPolyfills, defineCustomElements} from '@coveo/atomic/loader';
import {createApp} from 'vue';
import App from './App.vue';

applyPolyfills().then(() => {
  defineCustomElements(window);
});

const app = createApp(App);

app.mount('#app');
