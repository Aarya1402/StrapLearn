'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentJwt } from '@/lib/server-auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Upload logo to Strapi media library ─────────────────────────────────────
// Returns the numeric media ID (Strapi media fields use numeric id, not documentId)

async function uploadLogo(file: File, jwt: string): Promise<number | null> {
    if (!file || file.size === 0) return null;

    const uploadForm = new FormData();
    uploadForm.append('files', file);

    const res = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: uploadForm,
    });

    if (!res.ok) return null; // non-blocking — org still creates without logo

    const uploaded = await res.json();
    return uploaded?.[0]?.id ?? null;
}

// ─── Create Organization ──────────────────────────────────────────────────────

export async function createOrganizationAction(formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    // Step 1: Upload logo if provided
    const logoFile = formData.get('logo') as File | null;
    const logoId = logoFile && logoFile.size > 0 ? await uploadLogo(logoFile, jwt) : null;

    // Step 2: Create organisation with optional logo
    const payload: Record<string, unknown> = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || undefined,
        supportEmail: formData.get('supportEmail') || undefined,
        isActive: true,
    };
    if (logoId) payload.logo = logoId;

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
    redirect('/dashboard/admin/organizations');
}

// ─── Update Organization ──────────────────────────────────────────────────────

export async function updateOrganizationAction(documentId: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    // Step 1: Upload new logo if provided
    const logoFile = formData.get('logo') as File | null;
    const logoId = logoFile && logoFile.size > 0 ? await uploadLogo(logoFile, jwt) : null;

    // Step 2: Update organisation
    const payload: Record<string, unknown> = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || undefined,
        supportEmail: formData.get('supportEmail') || undefined,
    };
    if (logoId) payload.logo = logoId; // only update logo if a new one was uploaded

    const res = await fetch(`${STRAPI_URL}/api/organizations/${documentId}`, {
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
    revalidatePath(`/dashboard/admin/organizations/${documentId}`);
    redirect('/dashboard/admin/organizations');
}

// ─── Deactivate Organization ──────────────────────────────────────────────────

export async function deactivateOrganizationAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/organizations/${documentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: { isActive: false } }),
    });

    if (!res.ok) throw new Error('Failed to deactivate organization');
    revalidatePath('/dashboard/admin/organizations');
    redirect('/dashboard/admin/organizations');
}
