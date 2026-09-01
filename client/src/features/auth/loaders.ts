import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '../../lib/query-client';
import { currentUserQuery } from './queries';

/** Only allow paths on this origin, so ?next= can't bounce users off-site. */
export function safeNextPath(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
}

export async function requireAuthLoader({ request }: LoaderFunctionArgs) {
  const user = await queryClient.ensureQueryData(currentUserQuery());
  if (!user) {
    const url = new URL(request.url);
    const next = encodeURIComponent(url.pathname + url.search);
    throw redirect(`/login?next=${next}`);
  }
  return user;
}

export async function requireGuestLoader({ request }: LoaderFunctionArgs) {
  const user = await queryClient.ensureQueryData(currentUserQuery());
  if (user) throw redirect(safeNextPath(new URL(request.url).searchParams.get('next')));
  return null;
}
