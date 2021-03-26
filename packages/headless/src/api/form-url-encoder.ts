type FormEncodable = Record<string, string | number | boolean>;

export function encodeAsFormUrl(obj: FormEncodable) {
  const body = [];

  for (const property in obj) {
    const key = encodeURIComponent(property);
    const value = encodeURIComponent(obj[property]);
    body.push(`${key}=${value}`);
  }

  return body.join('&');
}

export function canBeFormUrlEncoded(obj: unknown): obj is FormEncodable {
  if (typeof obj !== 'object') {
    return false;
  }

  if (!obj) {
    return false;
  }

  return Object.values(obj).every(isPrimitive);
}

function isPrimitive(val: unknown) {
  return (
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  );
}
