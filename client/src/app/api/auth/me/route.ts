/**
 * MODULE 3 — Next.js API Routes: GET /api/auth/me  &  POST /api/auth/logout
 *
 * GET  /api/auth/me     → reads JWT from cookie, fetches user from Strapi
 * POST /api/auth/logout → clears the JWT cookie
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getMe } from '@/lib/auth';

// GET /api/auth/me
export async function GET() {
    try {
        const cookieStore = await cookies();
        const jwt = cookieStore.get('strapi_jwt')?.value;

        if (!jwt) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const user = await getMe(jwt);
        return NextResponse.json({ user }, { status: 200 });
    } catch {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}

// POST /api/auth/logout — clears cookie
export async function POST() {
    const cookieStore = await cookies();
    cookieStore.delete('strapi_jwt');
    return NextResponse.json({ success: true }, { status: 200 });
}
