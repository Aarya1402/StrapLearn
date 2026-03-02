/**
 * MODULE 3 — Next.js Proxy (replaces middleware.ts in Next.js 16+)
 *
 * Runs on every matched request (before rendering).
 * Handles:
 *  - Redirecting unauthenticated users to /login
 *  - Redirecting authenticated users away from /login and /register
 *  - Role-based access control per dashboard section
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const jwt = request.cookies.get('strapi_jwt')?.value;
    const roleType = request.cookies.get('user_role')?.value;

    // ── 1. Always allow: public paths, API routes, Next.js internals ─────────────
    if (
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/')
    ) {
        // If already logged in, redirect away from /login & /register
        if (jwt && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL(getDashboardPath(roleType), request.url));
        }
        return NextResponse.next();
    }

    // ── 2. Protected paths — require JWT ─────────────────────────────────────────
    if (!jwt) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── 3. Role-based access — only enforce when role cookie is present ───────────
    if (roleType && pathname.startsWith('/dashboard')) {
        const ROLE_ALLOWED: Record<string, string[]> = {
            org_admin: ['/dashboard/admin', '/dashboard/instructor', '/dashboard/student'],
            instructor: ['/dashboard/instructor', '/dashboard/student'],
            student: ['/dashboard/student'],
        };
        const allowed = ROLE_ALLOWED[roleType] ?? [];
        const canAccess = allowed.some((p) => pathname.startsWith(p));
        if (!canAccess) {
            return NextResponse.redirect(new URL(getDashboardPath(roleType), request.url));
        }
    }

    return NextResponse.next();
}

function getDashboardPath(roleType?: string): string {
    switch (roleType) {
        case 'org_admin': return '/dashboard/admin';
        case 'instructor': return '/dashboard/instructor';
        default: return '/dashboard/student';
    }
}

// Only run on page routes — NOT on _next/data, static assets, or API routes
export const config = {
    matcher: [
        '/login',
        '/register',
        '/dashboard/:path*',
        '/courses/:path*',
    ],
};
