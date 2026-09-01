import { Link, useNavigate, useSearchParams } from 'react-router';
import { errorMessage } from '../../lib/api';
import { AuthForm } from './AuthForm';
import { safeNextPath } from './loaders';
import { useRegister } from './queries';

export function RegisterPage() {
  const register = useRegister();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <>
      <h1 className="font-display text-title">Take a seat</h1>
      <p className="mb-6 text-ink-muted">Create an account to start your watchlist.</p>
      <AuthForm
        mode="register"
        isPending={register.isPending}
        serverError={register.error ? errorMessage(register.error) : undefined}
        onSubmit={(values) =>
          register.mutate(values, { onSuccess: () => navigate(safeNextPath(params.get('next')), { replace: true }) })
        }
      />
      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to={{ pathname: '/login', search: params.toString() && `?${params}` }} className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
