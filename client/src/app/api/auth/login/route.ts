/**
 * MODULE 3 — Next.js API Route: POST /api/auth/login
 *
 * Proxies credentials to Strapi, then sets the JWT as an httpOnly cookie
 * so the browser never touches the token directly.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import type { LoginPayload } from '@/lib/types/auth';

export async function POST(req: Request) {
    try {
        const body: LoginPayload = await req.json();
        const { jwt, user } = await login(body);

        // Set JWT in httpOnly cookie — not accessible by JavaScript
        const cookieStore = await cookies();
        cookieStore.set('strapi_jwt', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Return user info (NOT the JWT — it stays in the cookie)
        return NextResponse.json({ user }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Login failed' }, { status: 401 });
    }
}
