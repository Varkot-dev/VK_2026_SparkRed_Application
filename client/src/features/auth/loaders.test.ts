import { describe, expect, it } from 'vitest';
import { safeNextPath } from './loaders';

describe('safeNextPath', () => {
  it('accepts same-origin paths', () => {
    expect(safeNextPath('/search?q=matrix')).toBe('/search?q=matrix');
  });

  it('falls back to / for missing, external, or protocol-relative targets', () => {
    expect(safeNextPath(null)).toBe('/');
    expect(safeNextPath('https://evil.example')).toBe('/');
    expect(safeNextPath('//evil.example')).toBe('/');
  });
});
