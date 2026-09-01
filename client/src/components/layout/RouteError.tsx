import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { errorMessage } from '../../lib/api';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export function RouteError() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <EmptyState
        title={is404 ? 'That reel is missing' : 'Something went wrong'}
        description={is404 ? 'There is nothing at this address.' : errorMessage(error, 'An unexpected error occurred.')}
        action={
          <Button variant="secondary" onClick={() => (window.location.href = '/')}>
            Back to Marquee
          </Button>
        }
      />
      <Link to="/" className="sr-only">Home</Link>
    </div>
  );
}
