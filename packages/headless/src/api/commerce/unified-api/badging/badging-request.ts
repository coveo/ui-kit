import {BaseParam} from '../../../platform-service-params';
import {
  ModeParam,
  PlacementParam,
  PreviewOptsParam,
  SeedsParam,
  UserParam,
  ViewParam,
} from '../unified-api-params';

export type BadgingRequest = BaseParam &
  PlacementParam &
  ModeParam &
  ViewParam &
  PreviewOptsParam &
  UserParam &
  SeedsParam;
