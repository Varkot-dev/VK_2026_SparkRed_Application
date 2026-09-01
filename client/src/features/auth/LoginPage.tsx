import { Link, useNavigate, useSearchParams } from 'react-router';
import { errorMessage } from '../../lib/api';
import { AuthForm } from './AuthForm';
import { safeNextPath } from './loaders';
import { useLogin } from './queries';

export function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <>
      <h1 className="font-display text-title">Welcome back</h1>
      <p className="mb-6 text-ink-muted">Sign in to pick up your watchlist.</p>
      <AuthForm
        mode="login"
        isPending={login.isPending}
        serverError={login.error ? errorMessage(login.error) : undefined}
        onSubmit={(values) =>
          login.mutate(values, { onSuccess: () => navigate(safeNextPath(params.get('next')), { replace: true }) })
        }
      />
      <p className="mt-6 text-center text-sm text-ink-muted">
        New here?{' '}
        <Link to={{ pathname: '/register', search: params.toString() && `?${params}` }} className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
