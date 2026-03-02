import { registerAction } from '@/actions/auth.actions';
import { getCurrentUser, getDashboardPath } from '@/lib/server-auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  // If already logged in, redirect to dashboard
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role_type));

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'monospace' }}>
      <h1>Register — StrapLearn</h1>
      <form
        action={async (formData: FormData) => {
          'use server';
          await registerAction({
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            role_type: (formData.get('role_type') as 'org_admin' | 'instructor' | 'student') || 'student',
          });
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <label>
          Username
          <input name="username" type="text" required style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Email
          <input name="email" type="email" required style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={6} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Role
          <select name="role_type" style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="org_admin">Org Admin</option>
          </select>
        </label>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
          Create Account
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </main>
  );
}
