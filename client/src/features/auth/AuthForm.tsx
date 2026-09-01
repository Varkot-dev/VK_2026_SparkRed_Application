import { loginInput, registerInput, PASSWORD_MIN, USERNAME_MAX, USERNAME_MIN } from '@marquee/shared';
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

type Mode = 'login' | 'register';
type Values = { username: string; password: string };
type FieldErrors = Partial<Record<keyof Values, string>>;

type AuthFormProps = {
  mode: Mode;
  onSubmit: (values: Values) => void;
  isPending: boolean;
  serverError?: string | undefined;
};

const COPY: Record<Mode, { submit: string; pending: string }> = {
  login: { submit: 'Sign in', pending: 'Signing in…' },
  register: { submit: 'Create account', pending: 'Creating…' },
};

export function AuthForm({ mode, onSubmit, isPending, serverError }: AuthFormProps) {
  const [values, setValues] = useState<Values>({ username: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const schema = mode === 'register' ? registerInput : loginInput;
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Values;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  const update = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        value={values.username}
        onChange={update('username')}
        error={errors.username}
        hint={mode === 'register' ? `${USERNAME_MIN}–${USERNAME_MAX} characters, letters, numbers, underscores` : undefined}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        value={values.password}
        onChange={update('password')}
        error={errors.password}
        hint={mode === 'register' ? `At least ${PASSWORD_MIN} characters` : undefined}
      />
      {serverError && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-ink">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" isLoading={isPending} className="mt-2">
        {isPending ? COPY[mode].pending : COPY[mode].submit}
      </Button>
    </form>
  );
}
