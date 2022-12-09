import {ArrayValue, RecordValue, Schema} from '@coveo/bueno';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {configuration, attachedResults} from '../../../app/reducers';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions';
import {AttachedResult} from '../../../features/attached-results/attached-results-state';
import {
  AttachedResultsSection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  nonEmptyString,
  requiredNonEmptyString,
  validateInitialState,
} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface AttachToCaseState {
  attachedResults: AttachedResult[];
}

export interface AttachToCaseInitialState extends AttachToCaseState {}

export interface AttachToCaseProps {
  initialState?: AttachToCaseInitialState;
}

export interface SearchResult {
  title: string;
  raw: {
    permanentid?: string;
    urihash?: string;
  };
}

export interface AttachToCase extends Controller {
  isAttached(result: SearchResult): boolean;
  attach(result: AttachedResult): void;
  detach(result: AttachedResult): void;
}

const initialStateSchema = new Schema({
  attachedResults: new ArrayValue({
    required: false,
    each: new RecordValue({
      options: {
        required: true,
      },
      values: {
        knowledgeArticleId: nonEmptyString,
        articleLanguage: nonEmptyString,
        articleVersionNumber: nonEmptyString,
        articlePublishStatus: nonEmptyString,
        uriHash: nonEmptyString,
        permanentId: requiredNonEmptyString,
        resultUrl: requiredNonEmptyString,
        source: requiredNonEmptyString,
        title: requiredNonEmptyString,
      },
    }),
  }),
});

export function buildAttachToCase(
  engine: InsightEngine,
  props: AttachToCaseProps = {}
): AttachToCase {
  if (!loadAttachToCaseReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildAttachToCase'
  );

  return {
    ...controller,

    get state() {
      return {
        ...engine.state.attachedResults,
      };
    },

    isAttached(result) {
      console.log(
        `AttachedResults: ${engine.state.attachedResults.results.map(
          (r) => r.permanentId
        )}`
      );
      if (result.raw.permanentid || result.raw.urihash) {
        const isAttached = engine.state.attachedResults.results.some(
          (attached) =>
            attached.permanentId === result.raw.permanentid ||
            attached.uriHash === result.raw.urihash
        );
        return isAttached;
      }
      return false;
    },

    attach(result) {
      dispatch(attachResult({result}));
    },

    detach(result) {
      dispatch(detachResult({result}));
    },
  };
}

function loadAttachToCaseReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & AttachedResultsSection> {
  engine.addReducers({configuration, attachedResults});
  return true;
}
