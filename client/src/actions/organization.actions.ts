'use server';

/**
 * MODULE 4 — Organization Server Actions
 * Mutations: create, update, deactivate organization
 * Only accessible to org_admin and super admin roles.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentJwt } from '@/lib/server-auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Create Organization ─────────────────────────────────────────────────────

export async function createOrganizationAction(formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const payload = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || undefined,
        supportEmail: formData.get('supportEmail') || undefined,
        isActive: true,
    };

    const res = await fetch(`${STRAPI_URL}/api/organizations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to create organization');
    }

    revalidatePath('/dashboard/admin/organizations');
    return res.json();
}

// ─── Update Organization ─────────────────────────────────────────────────────

export async function updateOrganizationAction(id: number, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const payload = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || undefined,
        supportEmail: formData.get('supportEmail') || undefined,
    };

    const res = await fetch(`${STRAPI_URL}/api/organizations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to update organization');
    }

    revalidatePath('/dashboard/admin/organizations');
    revalidatePath(`/dashboard/admin/organizations/${id}`);
    return res.json();
}

// ─── Deactivate Organization (soft delete) ───────────────────────────────────

export async function deactivateOrganizationAction(id: number) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/organizations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: { isActive: false } }),
    });

    if (!res.ok) throw new Error('Failed to deactivate organization');
    revalidatePath('/dashboard/admin/organizations');
}
