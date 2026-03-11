/**
 * MODULE 3 — Server-side Auth Utilities
 *
 * Used in Server Components and layouts to:
 * - Get the current user from the JWT cookie
 * - Protect routes by redirecting if unauthenticated or wrong role
 *
 * NEVER import this in Client Components ('use client').
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMe } from './auth';
import type { RoleType, StrapiUser } from './types/auth';

// ─── Get current user (Server Components only) ─────────────────────────────

export async function getCurrentUser(): Promise<StrapiUser | null> {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('strapi_jwt')?.value;
    if (!jwt) return null;

    try {
        return await getMe(jwt);
    } catch {
        // JWT invalid/expired — return null
        // Cannot delete cookies here (only allowed in Server Actions/Route Handlers)
        return null;
    }
}

export async function getCurrentJwt(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('strapi_jwt')?.value ?? null;
}

// ─── Route protection helpers ───────────────────────────────────────────────

/**
 * Ensures user is authenticated.
 * - No JWT         → redirect to /login
 * - Invalid JWT    → redirect to /api/auth/clear-session (clears cookies, then /login)
 *                    This prevents the proxy from looping back to dashboard.
 */
export async function requireAuth(): Promise<StrapiUser> {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('strapi_jwt')?.value;
    const user = await getCurrentUser();

    if (!user) {
        if (jwt) {
            // Stale JWT exists — clear it via Route Handler to avoid proxy redirect loop
            redirect('/api/auth/clear-session');
        }
        redirect('/login');
    }

    return user;
}

/**
 * Ensures user has one of the specified roles.
 */
export async function requireRole(...roles: RoleType[]): Promise<StrapiUser> {
    const user = await requireAuth();
    if (!roles.includes(user.role_type as RoleType)) {
        redirect(getDashboardPath(user.role_type));
    }
    return user;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getDashboardPath(roleType?: string): string {
    switch (roleType) {
        case 'super_admin': return '/dashboard/super';
        case 'org_admin': return '/dashboard/admin';
        case 'instructor': return '/dashboard/instructor';
        default: return '/dashboard/student';
    }
}
