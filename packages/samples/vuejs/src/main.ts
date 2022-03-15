import {
  applyPolyfills,
  defineCustomElements,
} from '../node_modules/@coveo/atomic/loader';
import {createApp, defineCustomElement} from 'vue';
import App from './App.vue';
import ResultTextField from './components/ResultTextField.vue';

applyPolyfills().then(() => {
  defineCustomElements(window);
});

const app = createApp(App);
const resultTextField = defineCustomElement(ResultTextField);
customElements.define('result-text-field', resultTextField);

app.mount('#app');
