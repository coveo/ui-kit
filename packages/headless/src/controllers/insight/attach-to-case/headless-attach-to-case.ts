import {ArrayValue, RecordValue, Schema} from '@coveo/bueno';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {configuration, attached} from '../../../app/reducers';
import {
  AttachToCaseSection,
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

export interface AttachedResult {
  caseId: string;
  knowledgeArticleId?: string;
  articleLanguage?: string;
  articleVersionNumber?: number;
  articlePublishStatus?: string;
  uriHash?: string;
  permanentId?: string;
  resultUrl: string;
  source: string;
  title: string;
  name?: string;
}

export interface AttachToCaseState {
  attachedResults: AttachedResult[];
}

export interface AttachToCaseInitialState extends AttachToCaseState {}

export interface AttachToCaseProps {
  initialState?: AttachToCaseInitialState;
}

export interface AttachToCase extends Controller {
  isAttached(result: AttachedResult): boolean;
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
  // const {dispatch} = engine;

  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildAttachToCase'
  );

  const attachedResults = initialState.attachedResults;

  const getAttachedResults = () => {
    return attachedResults;
  };

  return {
    ...controller,

    get state() {
      return {
        ...engine.state.attached,
      };
    },

    isAttached(result) {
      console.log(getAttachedResults());
      return (
        engine.state.attached.attachedResults.findIndex(
          (attached) => attached.permanentId === result.permanentId
        ) !== -1
      );
    },

    attach(result) {
      console.log(result);
    },

    detach(result) {
      console.log(result);
    },
  };
}

function loadAttachToCaseReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & AttachToCaseSection> {
  engine.addReducers({configuration, attached});
  return true;
}
