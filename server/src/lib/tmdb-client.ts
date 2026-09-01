import type { MovieSummary, SearchResponse } from '@marquee/shared';
import { UpstreamError } from './errors';
import { TtlCache } from './ttl-cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const SEARCH_CACHE_TTL_MS = 60_000;
const MAX_RETRY_AFTER_MS = 2_000;

/** Shape of the TMDB /search/movie payload — only the fields we read. */
type TmdbSearchPayload = {
  page: number;
  total_pages: number;
  results: Array<{
    id: number;
    title: string;
    poster_path: string | null;
    release_date?: string;
    overview?: string;
    vote_average?: number;
  }>;
};

type TmdbClientOptions = {
  fetchImpl?: typeof fetch;
  cache?: TtlCache<SearchResponse>;
  sleep?: (ms: number) => Promise<void>;
};

/**
 * Thin, typed wrapper around the TMDB v3 API.
 * Owns the bearer token, a short response cache, and a single retry on 429,
 * so the rest of the server never sees raw TMDB shapes or rate-limit details.
 */
export class TmdbClient {
  private readonly fetchImpl: typeof fetch;
  private readonly cache: TtlCache<SearchResponse>;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(
    private readonly readToken: string,
    options: TmdbClientOptions = {},
  ) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.cache = options.cache ?? new TtlCache<SearchResponse>(SEARCH_CACHE_TTL_MS);
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  async searchMovies(query: string, page = 1): Promise<SearchResponse> {
    const cacheKey = `${query.toLowerCase()}::${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set('query', query);
    url.searchParams.set('page', String(page));
    url.searchParams.set('include_adult', 'false');

    const payload = await this.getJson<TmdbSearchPayload>(url);
    const response: SearchResponse = {
      results: payload.results.map(toMovieSummary),
      page: payload.page,
      totalPages: payload.total_pages,
    };
    this.cache.set(cacheKey, response);
    return response;
  }

  private async getJson<T>(url: URL, hasRetried = false): Promise<T> {
    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        headers: { Authorization: `Bearer ${this.readToken}`, Accept: 'application/json' },
      });
    } catch (cause) {
      throw new UpstreamError('Could not reach the movie database');
    }

    if (res.status === 429 && !hasRetried) {
      const retryAfterSec = Number(res.headers.get('retry-after') ?? '1');
      await this.sleep(Math.min(retryAfterSec * 1000, MAX_RETRY_AFTER_MS));
      return this.getJson<T>(url, true);
    }

    if (!res.ok) {
      throw new UpstreamError(`The movie database returned ${res.status}`);
    }
    return (await res.json()) as T;
  }
}

function toMovieSummary(raw: TmdbSearchPayload['results'][number]): MovieSummary {
  const year = raw.release_date ? Number(raw.release_date.slice(0, 4)) : NaN;
  return {
    tmdbId: raw.id,
    title: raw.title,
    posterPath: raw.poster_path ?? null,
    releaseYear: Number.isFinite(year) && year > 0 ? year : null,
    overview: raw.overview ?? '',
    voteAverage: raw.vote_average ?? 0,
  };
}
