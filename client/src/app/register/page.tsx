import { getCurrentUser, getDashboardPath } from '@/lib/server-auth';
import { getPublicOrganizations } from '@/lib/organization';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  // If already logged in, redirect to dashboard
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role_type));

  const organizations = await getPublicOrganizations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-2xl shadow-lg shadow-brand-500/20">
            S
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join an organization to start your learning journey
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-premium sm:p-10">
          <RegisterForm organizations={organizations} />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

