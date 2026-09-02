import { Link, useNavigate, useSearchParams } from 'react-router';
import { Window } from '../../components/layout/Window';
import { errorMessage } from '../../lib/api';
import { AuthForm } from './AuthForm';
import { safeNextPath } from './loaders';
import { useLogin } from './queries';

export function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const search = params.toString() ? `?${params}` : '';

  return (
    <Window
      eyebrow="Box office — window 1"
      heading="Sign in to your roll"
      foot={
        <>
          <span>New here?</span>
          <Link to={{ pathname: '/register', search }}>Open an account</Link>
        </>
      }
    >
      <AuthForm
        mode="login"
        isPending={login.isPending}
        serverError={login.error ? errorMessage(login.error) : undefined}
        onSubmit={(values) => login.mutate(values, { onSuccess: () => navigate(safeNextPath(params.get('next')), { replace: true }) })}
      />
    </Window>
  );
}
