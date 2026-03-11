/**
 * MODULE 3 — Auth Helpers (lib/auth.ts)
 *
 * All communication with Strapi's JWT auth endpoints.
 * JWT is stored in an httpOnly cookie (set by our Next.js API routes).
 */

import type { LoginPayload, RegisterPayload, StrapiAuthResponse, StrapiUser } from './types/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<StrapiAuthResponse> {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Login failed');
    }

    const authData = await res.json();

    // Strapi's login response only returns basic user fields — NOT custom ones like role_type.
    // We call getMe() with the returned JWT to get the full user object.
    const fullUser = await getMe(authData.jwt);

    return { jwt: authData.jwt, user: fullUser };
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload): Promise<StrapiAuthResponse> {
    // Uses custom endpoint that accepts role_type server-side
    // (default /api/auth/local/register rejects custom fields)

    const res = await fetch(`${STRAPI_URL}/api/auth/local/register-with-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Registration failed');
    }

    const authData = await res.json();

    // Enrich user with full fields (role_type, organization) via getMe()
    const fullUser = await getMe(authData.jwt);

    return { jwt: authData.jwt, user: fullUser };
}

// ─── Get current user (server-side, requires JWT) ────────────────────────────

export async function getMe(jwt: string): Promise<StrapiUser> {
    const res = await fetch(
        `${STRAPI_URL}/api/users/me?populate=organization`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        throw new Error('Failed to fetch user');
    }

    return res.json();
}

// ─── Get all users (Super Admin only) ────────────────────────────────────────

export async function getAllUsers(jwt: string): Promise<StrapiUser[]> {
    const res = await fetch(`${STRAPI_URL}/api/users?populate=organization`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export function getDashboardPath(roleType: string): string {
    switch (roleType) {
        case 'super_admin':
            return '/dashboard/super';
        case 'org_admin':
            return '/dashboard/admin';
        case 'instructor':
            return '/dashboard/instructor';
        case 'student':
        default:
            return '/dashboard/student';
    }
}

export function isSuperAdmin(roleType?: string) {
    return roleType === 'super_admin';
}

export function isOrgAdmin(roleType?: string) {
    return roleType === 'org_admin' || roleType === 'super_admin';
}

export function isInstructor(roleType?: string) {
    return roleType === 'instructor' || roleType === 'org_admin' || roleType === 'super_admin';
}

export function isStudent(roleType?: string) {
    return roleType === 'student';
}
