'use server';

/**
 * MODULE 5 — Course Server Actions
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentJwt } from '@/lib/server-auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Upload thumbnail ─────────────────────────────────────────────────────────

async function uploadThumbnail(file: File, jwt: string): Promise<number | null> {
    if (!file || file.size === 0) return null;
    const form = new FormData();
    form.append('files', file);
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: form,
    });
    if (!res.ok) return null;
    const uploaded = await res.json();
    return uploaded?.[0]?.id ?? null;
}

// ─── Create Course ────────────────────────────────────────────────────────────
// org_admin → course is auto-published by Strapi controller
// instructor → course is saved as draft until approved by org_admin
// instructor/organization are always set server-side in the Strapi controller

export async function createCourseAction(formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const thumbnailFile = formData.get('thumbnail') as File | null;
    const thumbnailId = thumbnailFile && thumbnailFile.size > 0
        ? await uploadThumbnail(thumbnailFile, jwt) : null;

    // `instructorId` is only present when an org_admin has picked a specific
    // instructor from the dropdown in the New Course form.
    const instructorId = (formData.get('instructorId') as string | null)?.trim() || undefined;

    const payload: Record<string, unknown> = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        isFree: formData.get('isFree') === 'true',
        price: formData.get('price') ? Number(formData.get('price')) : undefined,
        duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
        category: formData.get('categoryId') || undefined,
        // instructor is only passed when admin picks someone else from the dropdown
        ...(instructorId ? { instructor: instructorId } : {}),
        // organization + instructor assignment is finalized in the Strapi controller
    };
    if (thumbnailId) payload.thumbnail = thumbnailId;

    const res = await fetch(`${STRAPI_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        console.error('[createCourseAction] Strapi error:', JSON.stringify(err, null, 2));
        throw new Error(err?.error?.message || 'Failed to create course');
    }

    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}

// ─── Update Course ─────────────────────────────────────────────────────────

export async function updateCourseAction(documentId: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const thumbnailFile = formData.get('thumbnail') as File | null;
    const thumbnailId = thumbnailFile && thumbnailFile.size > 0
        ? await uploadThumbnail(thumbnailFile, jwt) : null;

    const payload: Record<string, unknown> = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        isFree: formData.get('isFree') === 'true',
        price: formData.get('price') ? Number(formData.get('price')) : undefined,
        duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
        category: formData.get('categoryId') || undefined,
    };
    if (thumbnailId) payload.thumbnail = thumbnailId;

    const res = await fetch(`${STRAPI_URL}/api/courses/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to update course');
    }

    revalidatePath('/dashboard/courses');
    revalidatePath(`/dashboard/courses/${documentId}`);
    redirect('/dashboard/courses');
}

// ─── Publish Course (org_admin only) ─────────────────────────────────────────
// Strapi v5: POST /:id/publish

export async function publishCourseAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/courses/${documentId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: {} }),
    });

    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch (e) { }
        console.error('Publish error from backend:', err);
        throw new Error(err?.error?.message || 'Failed to publish course');
    }
    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}

// ─── Unpublish Course ────────────────────────────────────────────────────────
// Strapi v5: POST /:id/actions/unpublish to revert to draft

export async function unpublishCourseAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/courses/${documentId}/unpublish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: {} }),
    });

    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch (e) { }
        console.error('Unpublish error from backend:', err);
        throw new Error(err?.error?.message || 'Failed to unpublish course');
    }
    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}

// ─── Delete Course ────────────────────────────────────────────────────────────

export async function deleteCourseAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    await fetch(`${STRAPI_URL}/api/courses/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
    });

    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}
