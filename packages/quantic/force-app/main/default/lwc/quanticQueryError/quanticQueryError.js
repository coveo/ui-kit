import { LightningElement, api, track } from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

let disconnectedException = 'Disconnected';
let noEndpointsException = 'NoEndpointsException';
let invalidTokenException = 'InvalidTokenException';
let organizationIsPausedException = 'OrganizationIsPausedException';

export default class QuanticQueryError extends LightningElement {
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").QueryError} */
  queryError;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  /**
   * @type {string}
   */
  @track type;
  /**
   * @type {Boolean}
   */
  @track hasError;
  /**
   * @type {string}
   */
  @track error

  showMoreInfo = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.queryError = CoveoHeadless.buildQueryError(engine);
    this.unsubscribe = this.queryError.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.type = this.queryError.state.error?.type;
    this.hasError = this.queryError.state.hasError;
    this.error = this.queryError.state.error ? JSON.stringify(this.queryError.state.error, null, 2): "";
  }

  get errorTitle() {
    switch (this.type) {
      case disconnectedException:
        return "Could not connect.";
      case noEndpointsException:
        return "The Coveo Organization has no registered endpoints.";
      case invalidTokenException:
        return "The Coveo Organization cannot be accessed.";
      case organizationIsPausedException:
        return "Your organization is resuming and will be available shortly.";
      default:
        return "Something went wrong.";
    }
  }

  get description() {
    switch (this.type) {
      case disconnectedException:
        return "Your query couldn't be sent. Verify your internet connection.";
      case noEndpointsException:
        return "You will need to add sources in your index, or wait for the created sources to finish indexing.";
      case invalidTokenException:
        return "The token is invalid.";
      case organizationIsPausedException:
        return "Your organization is resuming and will be available shortly.";
      default:
        return "If the problem persists contact the administrator.";
    }
  }

  get link() {
    switch (this.type) {
      case noEndpointsException:
        return "https://docs.coveo.com/";
      case invalidTokenException:
        return "https://docs.coveo.com/";
      case organizationIsPausedException:
        return "https://docs.coveo.com/l6af0467";
      default:
        return null;
    }
  }

  onClick() {
    this.showMoreInfo = !this.showMoreInfo;
  }
}