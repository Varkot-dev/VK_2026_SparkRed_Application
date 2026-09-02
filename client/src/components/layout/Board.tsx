import type { PublicUser } from '@marquee/shared';
import { Link, NavLink, useNavigate } from 'react-router';
import { useLogout } from '../../features/auth/queries';
import { useAllWatchlist } from '../../features/watchlist/queries';

const LINKS = [
  { to: '/', label: 'Watchlist', end: true },
  { to: '/search', label: 'Find a film', end: false },
];

/** The box-office board: wordmark, the two windows you can walk up to, and the ledger. */
export function Board({ user }: { user: PublicUser }) {
  const logout = useLogout();
  const navigate = useNavigate();
  const all = useAllWatchlist();
  const films = all.data?.length;
  const watched = all.data?.filter((i) => i.status === 'watched').length;

  return (
    <header className="board">
      <div className="wrap board__inner">
        <div className="board__id">
          <p className="board__eyebrow">Box office — open</p>
          <Link to="/" className="board__mark" aria-label="Marquee home">
            Mar<span>quee</span>
          </Link>
        </div>

        <nav className="board__nav" aria-label="Main navigation">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="board__link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ledger" aria-label="Your roll at a glance">
          <span className="ledger__row">
            <span>On the roll</span>
            <b>{films === undefined ? '…' : `${films} ${films === 1 ? 'film' : 'films'}`}</b>
          </span>
          <span className="ledger__row">
            <span>Torn</span>
            <b>{watched === undefined ? '…' : `${watched} watched`}</b>
          </span>
          <span className="ledger__row">
            <span>Signed in</span>
            <b>@{user.username}</b>
          </span>
          <button
            type="button"
            className="ledger__out"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  );
}
