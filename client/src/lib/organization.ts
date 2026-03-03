/**
 * MODULE 4 — Organization Fetch Helpers
 *
 * Used by Server Components to fetch organization data from Strapi.
 * All functions require a valid JWT (call from authenticated layouts/pages only).
 */

import type { StrapiUser } from './types/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface Organization {
    id: number;
    documentId: string;  // Strapi v5: use this in REST API URLs
    name: string;
    slug: string;
    primaryColor?: string;
    supportEmail?: string;
    isActive: boolean;
    logo?: { url: string };
    users?: StrapiUser[];
}

// ─── Get all organizations (Super Admin only) ────────────────────────────────

export async function getAllOrganizations(jwt: string): Promise<Organization[]> {
    const res = await fetch(`${STRAPI_URL}/api/organizations?populate=logo`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch organizations');
    const data = await res.json();
    return data.data;
}

// ─── Get single organization by documentId (Strapi v5) ──────────────────────

export async function getOrganizationById(documentId: string, jwt: string): Promise<Organization> {
    const res = await fetch(
        `${STRAPI_URL}/api/organizations/${documentId}?populate=logo`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('Failed to fetch organization');
    const data = await res.json();
    return data.data;
}

// ─── Get organization by slug (used by tenant middleware) ────────────────────

export async function getOrganizationBySlug(slug: string, jwt: string): Promise<Organization | null> {
    const res = await fetch(
        `${STRAPI_URL}/api/organizations?filters[slug][$eq]=${slug}&filters[isActive][$eq]=true`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0] ?? null;
}
