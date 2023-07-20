import {BaseParam} from '../../../platform-service-params';
import {
  ClientIdParam,
  ImplementationIdParam,
  ModeParam,
  PlacementIdParam,
  PreviewOptsParam,
  SeedsParam,
  UserParam,
  ViewParam,
  VisitorParam,
} from '../unified-api-params';

export type RecsRequest = BaseParam &
  PlacementIdParam &
  ModeParam &
  ImplementationIdParam &
  PreviewOptsParam &
  UserParam &
  ViewParam &
  VisitorParam &
  SeedsParam &
  ClientIdParam;
