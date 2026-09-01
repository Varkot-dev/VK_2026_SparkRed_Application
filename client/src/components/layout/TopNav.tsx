import type { PublicUser } from '@marquee/shared';
import { NavLink, useNavigate } from 'react-router';
import { useLogout } from '../../features/auth/queries';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Brand } from './Brand';

const LINKS = [
  { to: '/', label: 'Watchlist', end: true },
  { to: '/search', label: 'Search', end: false },
];

export function TopNav({ user }: { user: PublicUser }) {
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-0/80 backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Brand hideWordmarkOnMobile />
        <ul className="ml-1 flex items-center gap-0.5 sm:ml-6 sm:gap-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'relative inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium transition-colors duration-(--duration-fast) sm:px-3',
                    isActive ? 'text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-2',
                    'after:absolute after:inset-x-3 after:-bottom-[calc(50%-1px)] after:h-0.5 after:rounded-full after:bg-accent after:transition-opacity',
                    isActive ? 'after:opacity-100' : 'after:opacity-0',
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-ink-faint sm:inline">@{user.username}</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Sign out"
            isLoading={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}
          >
            <span className="hidden sm:inline">Sign out</span>
            <svg viewBox="0 0 20 20" fill="none" className="size-5 sm:hidden" aria-hidden="true">
              <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 14l4-4-4-4M17 10H8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </nav>
    </header>
  );
}
