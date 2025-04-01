@isTest
global class MockHttpTokenResponse implements HttpCalloutMock {
  private String endpointUrl;
  private String authorizationHeader;
  private String requestBody;
  private String mockedResponseBody;
  private Integer contentLength;
  private Integer responseCode;

  global MockHttpTokenResponse(
    String endpointUrl,
    String authorizationHeader,
    String requestBody,
    String mockedResponseBody,
    Integer contentLength,
    Integer responseCode
  ) {
    this.endpointUrl = endpointUrl;
    this.authorizationHeader = authorizationHeader;
    this.requestBody = requestBody;
    this.mockedResponseBody = mockedResponseBody;
    this.contentLength = contentLength;
    this.responseCode = responseCode;
  }

  global HTTPResponse respond(HTTPRequest req) {
    System.assertEquals(this.endpointUrl, req.getEndpoint());
    System.assertEquals(
      'application/json; charset=UTF-8',
      req.getHeader('Accept')
    );
    System.assertEquals(
      'application/json; charset=UTF-8',
      req.getHeader('Content-Type')
    );
    System.assertEquals(
      String.valueOf(contentLength),
      req.getHeader('Content-Length')
    );
    System.assertEquals(
      this.authorizationHeader,
      req.getHeader('Authorization')
    );
    System.assertEquals('POST', req.getMethod());
    System.assertEquals(this.requestBody, req.getBody());

    HttpResponse res = new HttpResponse();
    res.setBody(this.mockedResponseBody);
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setStatusCode(this.responseCode);
    return res;
  }
}
