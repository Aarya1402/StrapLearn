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

    return res.json();
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload): Promise<StrapiAuthResponse> {
    // Strapi's /auth/local/register only accepts: username, email, password
    // Custom fields like role_type must be set via a follow-up PUT call
    const { role_type, ...basePayload } = payload;

    const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Registration failed');
    }

    const authData: StrapiAuthResponse = await res.json();

    // Set role_type via a follow-up PUT using the returned JWT
    if (role_type) {
        await fetch(`${STRAPI_URL}/api/users/${authData.user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.jwt}`,
            },
            body: JSON.stringify({ role_type }),
        });
        authData.user.role_type = role_type;
    }

    return authData;
}

// ─── Get current user (server-side, requires JWT) ────────────────────────────

export async function getMe(jwt: string): Promise<StrapiUser> {
    // Note: organization populate is added in Module 4 once the content type exists
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch user');
    }

    return res.json();
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export function getDashboardPath(roleType: string): string {
    switch (roleType) {
        case 'org_admin':
            return '/dashboard/admin';
        case 'instructor':
            return '/dashboard/instructor';
        case 'student':
        default:
            return '/dashboard/student';
    }
}

export function isOrgAdmin(roleType?: string) {
    return roleType === 'org_admin';
}

export function isInstructor(roleType?: string) {
    return roleType === 'instructor' || roleType === 'org_admin';
}

export function isStudent(roleType?: string) {
    return roleType === 'student';
}
