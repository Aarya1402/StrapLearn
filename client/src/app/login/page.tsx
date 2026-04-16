import { loginAction } from '@/actions/auth.actions';
import { getCurrentUser } from '@/lib/server-auth';
import { getDashboardPath } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default async function LoginPage() {
  // If already logged in, redirect to dashboard
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role_type));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-2xl shadow-lg shadow-brand-500/20">
            S
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/register" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Create an account
            </a>
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-premium sm:p-10">
          <form
            action={async (formData: FormData) => {
              'use server';
              await loginAction({
                identifier: formData.get('identifier') as string,
                password: formData.get('password') as string,
              });
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="identifier">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="name@example.com"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg active:scale-[0.98] shadow-brand-500/20"
            >
              <LogIn size={18} />
              Sign In
              <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>

        <p className="px-8 text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline transition-colors hover:text-brand-600">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="underline transition-colors hover:text-brand-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

