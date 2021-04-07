import {HTTPContentType, HttpMethods} from '../platform-client';

export interface ObjectIdParam {
  objectId?: string;
}

export interface BaseParam {
  url: string;
  accessToken: string;
  organizationId: string;
}

export interface DebugParam {
  debug: boolean;
}

export const baseMLRequest = (
  req: BaseParam,
  method: HttpMethods,
  contentType: HTTPContentType,
  path: string,
  debug: boolean
) => ({
  accessToken: req.accessToken,
  method,
  contentType,
  url: `${req.url}${path}${debug ? '?debug=1' : ''}`,
});
