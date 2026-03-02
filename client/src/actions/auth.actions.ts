'use server';

/**
 * MODULE 3 — Auth Server Actions
 * Mutations that go directly to Strapi without a separate API route.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { login, register } from '@/lib/auth';
import type { LoginPayload, RegisterPayload } from '@/lib/types/auth';
import { getDashboardPath } from '@/lib/server-auth';

function setCookies(cookieStore: any, jwt: string, roleType: string) {
    cookieStore.set('strapi_jwt', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });
    // user_role is NOT httpOnly — proxy.ts needs to read it for RBAC
    cookieStore.set('user_role', roleType ?? 'student', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });
}

// ─── Login Action ────────────────────────────────────────────────────────────

export async function loginAction(payload: LoginPayload) {
    const { jwt, user } = await login(payload);
    const cookieStore = await cookies();
    setCookies(cookieStore, jwt, user.role_type);
    redirect(getDashboardPath(user.role_type));
}

// ─── Register Action ─────────────────────────────────────────────────────────

export async function registerAction(payload: RegisterPayload) {
    const { jwt, user } = await register(payload);
    const cookieStore = await cookies();
    setCookies(cookieStore, jwt, user.role_type);
    redirect(getDashboardPath(user.role_type));
}

// ─── Logout Action ───────────────────────────────────────────────────────────

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('strapi_jwt');
    cookieStore.delete('user_role');
    redirect('/login');
}
