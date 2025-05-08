import {createHash} from 'crypto';

/**
 * Compute a short hash from a string (e.g., file content or file path)
 */
export default function computeHash(input) {
  const hash = createHash('sha256').update(input).digest('hex');
  return hash.slice(0, 8);
}
