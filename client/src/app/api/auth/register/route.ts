/**
 * MODULE 3 — Next.js API Route: POST /api/auth/register
 *
 * Registers a new user in Strapi and immediately sets the JWT cookie.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import type { RegisterPayload } from '@/lib/types/auth';

export async function POST(req: Request) {
    try {
        const body: RegisterPayload = await req.json();
        const { jwt, user } = await register(body);

        // Set JWT in httpOnly cookie
        const cookieStore = await cookies();
        cookieStore.set('strapi_jwt', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 400 });
    }
}
