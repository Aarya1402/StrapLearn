import { loginAction } from '@/actions/auth.actions';
import { getCurrentUser } from '@/lib/server-auth';
import { getDashboardPath } from '@/lib/server-auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // If already logged in, redirect to dashboard
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role_type));

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'monospace' }}>
      <h1>Login — StrapLearn</h1>
      <form
        action={async (formData: FormData) => {
          'use server';
          await loginAction({
            identifier: formData.get('identifier') as string,
            password: formData.get('password') as string,
          });
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <label>
          Email / Username
          <input name="identifier" type="text" required style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Password
          <input name="password" type="password" required style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        No account? <a href="/register">Register</a>
      </p>
    </main>
  );
}
