import type { LoginInput, PublicUser, RegisterInput } from '@marquee/shared';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const authKeys = { me: ['auth', 'me'] as const };

const ME_STALE_MS = 5 * 60 * 1000;

/** `null` means "definitely signed out", which is a valid cached answer. */
export const currentUserQuery = () =>
  queryOptions({
    queryKey: authKeys.me,
    staleTime: ME_STALE_MS,
    queryFn: () => api<PublicUser | null>('/api/auth/me'),
  });

export function useCurrentUser() {
  return useQuery(currentUserQuery());
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api<PublicUser>('/api/auth/login', { method: 'POST', json: input }),
    onSuccess: (user) => queryClient.setQueryData(authKeys.me, user),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => api<PublicUser>('/api/auth/register', { method: 'POST', json: input }),
    onSuccess: (user) => queryClient.setQueryData(authKeys.me, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // Everything cached belonged to the signed-out user.
      queryClient.removeQueries();
      queryClient.setQueryData(authKeys.me, null);
    },
  });
}
