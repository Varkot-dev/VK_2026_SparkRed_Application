import { isRouteErrorResponse, useRouteError } from 'react-router';
import { errorMessage } from '../../lib/api';
import { Button } from '../ui/Button';
import { Notice } from '../ui/Notice';

export function RouteError() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="lobby">
      <Notice
        roll={is404 ? 'No such screen' : 'Projector fault'}
        title={is404 ? 'Nothing showing here' : 'Something went wrong'}
        action={
          <Button variant="ghost" onClick={() => (window.location.href = '/')}>
            Back to the box office
          </Button>
        }
      >
        {is404 ? 'There is nothing at this address.' : errorMessage(error, 'An unexpected error occurred.')}
      </Notice>
    </div>
  );
}
