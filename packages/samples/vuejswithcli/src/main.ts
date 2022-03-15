import {applyPolyfills, defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/dist/atomic/themes/coveo.css';
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
