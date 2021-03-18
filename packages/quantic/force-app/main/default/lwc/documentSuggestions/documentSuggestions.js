import { initializeComponent } from 'c/initialization';
import {api, LightningElement, track} from 'lwc';

export default class DocumentSuggestions extends LightningElement {
    @track state = {
        documents: [],
        totalCount: 0,
        responseId: '',
        loading: false,
        error: null,
    };
    unsubscribe;
    caseAssist;

    connectedCallback() {
        initializeComponent(this);
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    @api
    initialize(engine) {
        this.caseAssist = CoveoHeadless.buildCaseAssist(engine);
        this.unsubscribe = this.caseAssist.subscribe(() => this.updateState());
    }

    updateState() {
        this.state = this.caseAssist.state.documentSuggestions;
    }

    get hasDocuments() {
        return !this.state.loading && !this.state.error && this.state.documents.length > 0;
    }
}
