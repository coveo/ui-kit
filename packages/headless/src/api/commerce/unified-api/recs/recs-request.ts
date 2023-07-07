import {BaseParam} from '../../../platform-service-params';
import {
  ImplementationParam,
  ModeParam,
  PlacementParam,
  PreviewOptsParam,
  SeedsParam,
  UserParam,
  ViewParam,
  VisitorParam,
} from '../unified-api-params';

export type RecsRequest = BaseParam &
  PlacementParam &
  ModeParam &
  ImplementationParam &
  PreviewOptsParam &
  UserParam &
  ViewParam &
  VisitorParam &
  SeedsParam;
