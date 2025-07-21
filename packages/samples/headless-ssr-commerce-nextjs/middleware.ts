import {type NextRequest, NextResponse} from 'next/server';

export default function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  const uuid = crypto.randomUUID();
  requestHeaders.set('x-coveo-client-id', uuid);
  response.headers.set('x-coveo-client-id', uuid);
  response.headers.set('x-href', request.nextUrl.href);
  return response;
}
