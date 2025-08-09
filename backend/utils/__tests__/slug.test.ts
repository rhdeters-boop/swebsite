import { toSlug } from '@/backend/utils/slug';

describe('toSlug (unit)', () => {
  test('trims, lowercases, removes diacritics, and collapses separators', () => {
    const input = '  Héllo,  World!!  ';
    const out = toSlug(input);
    expect(out).toBe('hello-world');
  });

  test('returns empty string for only symbols', () => {
    expect(toSlug('---___***')).toBe('');
  });
});