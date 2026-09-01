import { describe, expect, it, vi } from 'vitest';
import type { WatchlistItemRow } from '../src/db/schema';
import { ConflictError, NotFoundError, ValidationError } from '../src/lib/errors';
import type { WatchlistRepository } from '../src/repositories/watchlist.repository';
import { WatchlistService } from '../src/services/watchlist.service';

const USER = 7;

function makeRow(overrides: Partial<WatchlistItemRow> = {}): WatchlistItemRow {
  return {
    id: 1,
    userId: USER,
    tmdbId: 27205,
    title: 'Inception',
    posterPath: '/x.jpg',
    releaseYear: 2010,
    status: 'want',
    rating: null,
    addedAt: new Date('2026-09-01T00:00:00Z'),
    updatedAt: new Date('2026-09-01T00:00:00Z'),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<WatchlistRepository> = {}) {
  return {
    listForUser: vi.fn().mockResolvedValue([makeRow()]),
    findForUser: vi.fn().mockResolvedValue(null),
    findByMovie: vi.fn().mockResolvedValue(null),
    insert: vi.fn().mockImplementation(async (input) => makeRow(input)),
    update: vi.fn().mockImplementation(async (id, _userId, patch) => makeRow({ id, ...patch })),
    delete: vi.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as WatchlistRepository;
}

const addInput = { tmdbId: 27205, title: 'Inception', posterPath: '/x.jpg', releaseYear: 2010 };

describe('WatchlistService.add', () => {
  it('inserts the item scoped to the user and serialises dates', async () => {
    const repo = makeRepo();
    const item = await new WatchlistService(repo).add(USER, addInput);

    expect(repo.insert).toHaveBeenCalledWith({ userId: USER, ...addInput });
    expect(item).toMatchObject({ tmdbId: 27205, status: 'want', rating: null, addedAt: '2026-09-01T00:00:00.000Z' });
  });

  it('throws ConflictError when the movie is already on the list', async () => {
    const repo = makeRepo({ findByMovie: vi.fn().mockResolvedValue(makeRow()) });

    await expect(new WatchlistService(repo).add(USER, addInput)).rejects.toBeInstanceOf(ConflictError);
    expect(repo.insert).not.toHaveBeenCalled();
  });
});

describe('WatchlistService.update', () => {
  it('throws NotFoundError when the item belongs to someone else', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(null) });

    await expect(new WatchlistService(repo).update(USER, 1, { status: 'watched' })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects a rating unless the item is (or becomes) watched', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(makeRow({ status: 'want' })) });

    await expect(new WatchlistService(repo).update(USER, 1, { rating: 8 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('allows setting watched and a rating in one request', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(makeRow({ status: 'want' })) });

    const item = await new WatchlistService(repo).update(USER, 1, { status: 'watched', rating: 9 });

    expect(repo.update).toHaveBeenCalledWith(1, USER, { status: 'watched', rating: 9 });
    expect(item).toMatchObject({ status: 'watched', rating: 9 });
  });

  it('clears the rating when a watched item moves back to want/watching', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(makeRow({ status: 'watched', rating: 7 })) });

    await new WatchlistService(repo).update(USER, 1, { status: 'watching' });

    expect(repo.update).toHaveBeenCalledWith(1, USER, { status: 'watching', rating: null });
  });

  it('keeps the existing rating when only status=watched is re-sent', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(makeRow({ status: 'watched', rating: 7 })) });

    await new WatchlistService(repo).update(USER, 1, { status: 'watched' });

    expect(repo.update).toHaveBeenCalledWith(1, USER, { status: 'watched', rating: 7 });
  });

  it('allows explicitly clearing a rating with null', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(makeRow({ status: 'watched', rating: 7 })) });

    await new WatchlistService(repo).update(USER, 1, { rating: null });

    expect(repo.update).toHaveBeenCalledWith(1, USER, { status: 'watched', rating: null });
  });
});

describe('WatchlistService.remove', () => {
  it('deletes an owned item', async () => {
    const repo = makeRepo({ findForUser: vi.fn().mockResolvedValue(makeRow()) });
    await new WatchlistService(repo).remove(USER, 1);
    expect(repo.delete).toHaveBeenCalledWith(1, USER);
  });

  it('throws NotFoundError for an item the user does not own', async () => {
    const repo = makeRepo();
    await expect(new WatchlistService(repo).remove(USER, 1)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
