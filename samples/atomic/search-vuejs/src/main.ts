import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import {createApp, defineCustomElement} from 'vue';
import App from './App.vue';
import ResultTextField from './components/ResultTextField.vue';
import ResultTextFieldMultivalue from './components/ResultTextFieldMultivalue.vue';

defineCustomElements(window);

const app = createApp(App);
const resultTextField = defineCustomElement(ResultTextField);
const resultTextFieldMultivalue = defineCustomElement(
  ResultTextFieldMultivalue
);
customElements.define('result-text-field', resultTextField);
customElements.define(
  'result-text-field-multivalue',
  resultTextFieldMultivalue
);

app.mount('#app');
