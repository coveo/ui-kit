import {BaseParam} from '../../../platform-service-params';
import {
  ClientIdParam,
  ModeParam,
  PlacementIdParam,
  PreviewOptsParam,
  SeedsParam,
  UserParam,
  ViewParam,
} from '../unified-api-params';

export type BadgingRequest = BaseParam &
  PlacementIdParam &
  ModeParam &
  ViewParam &
  PreviewOptsParam &
  UserParam &
  SeedsParam &
  ClientIdParam;
