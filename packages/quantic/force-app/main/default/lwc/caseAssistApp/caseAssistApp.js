import {LightningElement, track} from 'lwc';
import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
import AtomicPath from '@salesforce/resourceUrl/atomicutils';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

export default class CaseAssistApp extends LightningElement {
    @track state;

    engine;
    dependenciesLoaded = false;
    config;
    caseAssist;
    componentsToInitialize = [];
    unsubscribe;

    async connectedCallback() {
        if (this.dependenciesLoaded) {
            return;
        }

        try {
            await Promise.all([
               loadScript(this, HeadlessPath + '/browser/headless.js'),
               loadScript(this, AtomicPath + '/atomic-utils.js'), 
            ]);

            this.loadDependencies();
            if (this.dependenciesLoaded) {
                this.initEngine();
                this.caseAssist = CoveoHeadless.buildCaseAssist(this.engine);
                this.unsubscribe = this.caseAssist.subscribe(() => this.updateState());

                this.componentsToInitialize.forEach((cmp) => cmp.initialize(this.engine));

                this.caseAssist.setCaseAssistId('42f425ff-fdb9-4438-b457-185b2fc5fc0e');
            }
        } catch (error) {
            console.error('Fatal error: unable to initialize Case Assist app', error);
        }
    }

    loadDependencies() {
        // TODO: This should go after the config is set...
        this.dependenciesLoaded = true;

        this.config = CoveoHeadless.HeadlessEngine.getSampleConfiguration();
        this.config.organizationId = 'lbergeronsfdevt1z2624x';
        this.config.accessToken = 'xxc4fa7e0b-cc28-4a46-a648-1fb055c94808';
        this.config.platformUrl = 'https://platformdev.cloud.coveo.com';
    }

    initEngine() {
        this.engine = new CoveoHeadless.HeadlessEngine({
            configuration: this.config,
            reducers: CoveoHeadless.caseAssistAppReducers,
        });
        return this.engine;
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    updateState() {
        this.state = this.caseAssist.state;
    }

    handleInitialization(event) {
        this.componentsToInitialize.push(event.detail);
    }

    subjectchanged(event) {
        this.caseAssist.setCaseInformationValue('subject', event.target.value);
        this.invalidateSuggestions();
    }

    descriptionchanged(event) {
        this.caseAssist.setCaseInformationValue('description', event.target.value);
        this.invalidateSuggestions();
    }

    invalidateSuggestions() {
        this.caseAssist.getClassifications();
        this.caseAssist.getDocumentSuggestions();
    }
}