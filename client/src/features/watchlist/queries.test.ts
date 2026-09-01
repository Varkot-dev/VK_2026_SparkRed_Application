import type { WatchlistItem } from '@marquee/shared';
import { describe, expect, it } from 'vitest';
import { applyUpdate, watchlistKeys } from './queries';

const item: WatchlistItem = {
  id: 1,
  tmdbId: 603,
  title: 'The Matrix',
  posterPath: null,
  releaseYear: 1999,
  status: 'watched',
  rating: 8,
  addedAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('applyUpdate (optimistic mirror of the server rule)', () => {
  it('keeps the rating when status stays watched', () => {
    expect(applyUpdate(item, { status: 'watched' })).toMatchObject({ status: 'watched', rating: 8 });
  });

  it('clears the rating when leaving watched', () => {
    expect(applyUpdate(item, { status: 'want' })).toMatchObject({ status: 'want', rating: null });
  });

  it('applies a new rating on a watched item and allows clearing with null', () => {
    expect(applyUpdate(item, { rating: 10 }).rating).toBe(10);
    expect(applyUpdate(item, { rating: null }).rating).toBeNull();
  });

  it('never shows a rating on a non-watched item even if one is sent', () => {
    expect(applyUpdate({ ...item, status: 'want', rating: null }, { rating: 7 }).rating).toBeNull();
  });
});

describe('watchlistKeys.list', () => {
  it('hashes an absent status and an undefined status identically', () => {
    const a = watchlistKeys.list({ sort: 'addedAt', order: 'desc' });
    const b = watchlistKeys.list({ status: undefined, sort: 'addedAt', order: 'desc' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
