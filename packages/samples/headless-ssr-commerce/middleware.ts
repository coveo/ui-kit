import {NextRequest, NextResponse} from 'next/server';

export default function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const uuid = crypto.randomUUID();
  headers.set('x-coveo-client-id', uuid);
  headers.set('x-coveo-href', request.nextUrl.href);
  const response = NextResponse.next({headers});
  response.headers.set('x-coveo-client-id', uuid);
  return response;
}
