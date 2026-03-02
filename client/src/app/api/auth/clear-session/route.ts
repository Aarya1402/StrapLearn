/**
 * GET /api/auth/clear-session
 *
 * Route Handler — clears stale/invalid JWT cookies and redirects to /login.
 * Called by requireAuth() when a JWT exists but fails validation.
 * Route Handlers are allowed to modify cookies (unlike Server Components).
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    cookieStore.delete('strapi_jwt');
    cookieStore.delete('user_role');

    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
