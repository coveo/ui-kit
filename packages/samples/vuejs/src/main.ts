import {createApp, defineCustomElement} from 'vue';
import App from './App.vue';
import ResultTextField from './components/ResultTextField.vue';

const resultTextField = defineCustomElement(ResultTextField);
customElements.define('result-text-field', resultTextField);

const app = createApp(App);

app.mount('#app');
