import {createApp, defineCustomElement} from 'vue';
import App from './App.vue';
import ResultLabel from './components/ResultLabel.vue';

const resultLabel = defineCustomElement(ResultLabel);
customElements.define('result-label', resultLabel);

const app = createApp(App);

app.mount('#app');
