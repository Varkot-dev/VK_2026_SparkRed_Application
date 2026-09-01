import { describe, expect, it, vi } from 'vitest';
import { TmdbClient } from '../src/lib/tmdb-client';
import { UpstreamError } from '../src/lib/errors';

const samplePayload = {
  page: 1,
  total_pages: 3,
  results: [
    { id: 27205, title: 'Inception', poster_path: '/x.jpg', release_date: '2010-07-15', overview: 'Dreams', vote_average: 8.4 },
    { id: 1, title: 'No Date', poster_path: null, release_date: '', vote_average: 0 },
  ],
};

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

describe('TmdbClient.searchMovies', () => {
  it('maps TMDB rows to MovieSummary and normalises missing fields', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(samplePayload));
    const client = new TmdbClient('token', { fetchImpl });

    const result = await client.searchMovies('inception');

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.results[0]).toEqual({
      tmdbId: 27205,
      title: 'Inception',
      posterPath: '/x.jpg',
      releaseYear: 2010,
      overview: 'Dreams',
      voteAverage: 8.4,
    });
    expect(result.results[1]).toMatchObject({ posterPath: null, releaseYear: null, overview: '' });
  });

  it('sends the bearer token and the query', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(samplePayload));
    const client = new TmdbClient('secret-token', { fetchImpl });

    await client.searchMovies('the matrix', 2);

    const [url, init] = fetchImpl.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get('query')).toBe('the matrix');
    expect(url.searchParams.get('page')).toBe('2');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-token');
  });

  it('serves a repeated query from cache (case-insensitive) without refetching', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(samplePayload));
    const client = new TmdbClient('token', { fetchImpl });

    await client.searchMovies('Inception');
    await client.searchMovies('inception');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries once after a 429, honouring Retry-After', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 429, { 'retry-after': '1' }))
      .mockResolvedValueOnce(jsonResponse(samplePayload));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const client = new TmdbClient('token', { fetchImpl, sleep });

    const result = await client.searchMovies('inception');

    expect(sleep).toHaveBeenCalledWith(1000);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.results).toHaveLength(2);
  });

  it('throws UpstreamError on a second 429 or any other failure status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 429));
    const client = new TmdbClient('token', { fetchImpl, sleep: async () => {} });

    await expect(client.searchMovies('x')).rejects.toBeInstanceOf(UpstreamError);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('wraps network failures in UpstreamError', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const client = new TmdbClient('token', { fetchImpl });

    await expect(client.searchMovies('x')).rejects.toBeInstanceOf(UpstreamError);
  });
});
