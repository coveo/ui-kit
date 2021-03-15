import {encodeAsFormUrl} from './form-url-encoder';

describe('encodeAsFormUrl', () => {
  it('a record with string key and value, it encodes it correctly', () => {
    const payload = {a: 'b'};

    expect(encodeAsFormUrl(payload)).toEqual('a=b');
  });

  it('a record with multiple string keys and values, it encodes it correctly', () => {
    const payload = {a: 'b', c: 'd'};

    expect(encodeAsFormUrl(payload)).toEqual('a=b&c=d');
  });

  it('a record with a key containing an unsafe url character, it encodes the key', () => {
    const payload = {'&': 'b'};

    expect(encodeAsFormUrl(payload)).toEqual('%26=b');
  });

  it('a record with a value containing an unsafe url character, it encodes the value', () => {
    const payload = {a: '&'};

    expect(encodeAsFormUrl(payload)).toEqual('a=%26');
  });
});
