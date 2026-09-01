import { describe, expect, it } from 'vitest';
import { TtlCache } from '../src/lib/ttl-cache';

describe('TtlCache', () => {
  it('returns a value before it expires and undefined after', () => {
    let now = 1_000;
    const cache = new TtlCache<string>(100, 10, () => now);

    cache.set('k', 'v');
    expect(cache.get('k')).toBe('v');

    now = 1_099;
    expect(cache.get('k')).toBe('v');

    now = 1_100;
    expect(cache.get('k')).toBeUndefined();
  });

  it('evicts the oldest entry once maxEntries is reached', () => {
    const cache = new TtlCache<number>(10_000, 2);

    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
    expect(cache.size).toBe(2);
  });

  it('returns undefined for keys that were never set', () => {
    const cache = new TtlCache<number>(1000);
    expect(cache.get('missing')).toBeUndefined();
  });
});
