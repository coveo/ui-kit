import {LightningElement, api} from 'lwc';
import {getHeadlessEngine} from 'c/headlessLoader';

export default class ResultLink extends LightningElement {
  /** @type {import("coveo").Result} */
  @api result;
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Engine} */
  engine;

  connectedCallback() {
    getHeadlessEngine(this.engineId).then((engine) => {
      this.initialize(engine);
    }).catch((error) => {
      console.error(error.message);
    });
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.engine = engine;
    this.bindLogDocumentOpenOnResult(
      this.engine,
      this.result,
      this.template
    );
  }

  /**
   * Binds the logging of document
   * @returns An unbind function for the events
   * @param {import("coveo").Engine} engine An instance of an Headless Engine
   * @param {import("coveo").Result} result The result object
   * @param {import("lwc").ShadowRootTheGoodPart} resultElement Parent result element
   * @param {string} selector Optional. Css selector that selects all links to the document. Default: "a" tags with the clickUri as "href" parameter.
   */
  bindLogDocumentOpenOnResult(
    engine,
    result,
    resultElement,
    selector = undefined,
  ) {
    const interactiveResult = CoveoHeadless.buildInteractiveResult(engine, {
      options: {result},
    });

    const eventsMap = {
      contextmenu: () => interactiveResult.select(),
      click: () => interactiveResult.select(),
      mouseup: () => interactiveResult.select(),
      mousedown: () => interactiveResult.select(),
      touchstart: () => interactiveResult.beginDelayedSelect(),
      touchend: () => interactiveResult.cancelPendingSelect(),
    };
    const elements = resultElement.querySelectorAll(selector || 'a');

    elements.forEach((element) => {
      Object.keys(eventsMap).forEach((key) =>
        element.addEventListener(key, eventsMap[key])
      );
    });

    return () => {
      elements.forEach((element) => {
        Object.keys(eventsMap).forEach((key) =>
          element.removeEventListener(key, eventsMap[key])
        );
      });
    };
  }
}
