import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from './api';

const STALE_TIME_MS = 30_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      // 4xx responses are deterministic; retrying them only delays the error state.
      retry: (failureCount, err) => !(err instanceof ApiClientError && err.status < 500) && failureCount < 2,
      refetchOnWindowFocus: false,
    },
  },
});
