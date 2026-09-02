import { Link, useNavigate, useSearchParams } from 'react-router';
import { Window } from '../../components/layout/Window';
import { errorMessage } from '../../lib/api';
import { AuthForm } from './AuthForm';
import { safeNextPath } from './loaders';
import { useRegister } from './queries';

export function RegisterPage() {
  const register = useRegister();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const search = params.toString() ? `?${params}` : '';

  return (
    <Window
      eyebrow="Box office — new accounts"
      heading="Open an account"
      foot={
        <>
          <span>Already have one?</span>
          <Link to={{ pathname: '/login', search }}>Sign in</Link>
        </>
      }
    >
      <AuthForm
        mode="register"
        isPending={register.isPending}
        serverError={register.error ? errorMessage(register.error) : undefined}
        onSubmit={(values) => register.mutate(values, { onSuccess: () => navigate(safeNextPath(params.get('next')), { replace: true }) })}
      />
    </Window>
  );
}
