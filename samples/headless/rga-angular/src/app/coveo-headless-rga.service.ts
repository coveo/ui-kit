/* src/app/coveo-headless-rga.service.ts */
import {Injectable} from '@angular/core';
import {
  buildGeneratedAnswer,
  buildSearchBox,
  buildSearchEngine,
  type GeneratedAnswer,
  getSampleSearchEngineConfiguration,
  type SearchBox,
  type SearchEngine,
} from '@coveo/headless';

@Injectable({providedIn: 'root'})
export class CoveoHeadlessRGAService {
  private _engine?: SearchEngine;

  initEngine() {
    if (this._engine) return this._engine;

    this._engine = buildSearchEngine({
      configuration: {
        ...getSampleSearchEngineConfiguration(),
        search: {
          pipeline: 'genqatest',
        },
      },
    }); // callout[Refer to <a href="#instantiating-the-engine-and-the-controller">Instantiating the engine and the controller</a> to better understand your `searchEngine` controller. The above example is not intended for production use.]
    return this._engine;
  }

  get engine(): SearchEngine {
    if (!this._engine) {
      throw new Error(
        'Headless Engine not initialized. Call initEngine() first.'
      );
    }
    return this._engine;
  }

  buildSearchBox(): SearchBox {
    return buildSearchBox(this.engine);
  }

  buildGeneratedAnswer(): GeneratedAnswer {
    return buildGeneratedAnswer(this.engine);
  }
}
