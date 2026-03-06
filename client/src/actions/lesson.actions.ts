'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentJwt } from '@/lib/server-auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Create Lesson ────────────────────────────────────────────────────────────

export async function createLessonAction(courseDocumentId: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const payload = {
        title: formData.get('title'),
        content: formData.get('content') ? [{ type: 'paragraph', children: [{ type: 'text', text: formData.get('content') }] }] : undefined,
        videoUrl: formData.get('videoUrl') || undefined,
        videoProvider: formData.get('videoProvider') || undefined,
        duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
        order: Number(formData.get('order')) || 1,
        isFree: formData.get('isFree') === 'true',
        course: courseDocumentId,
    };

    const res = await fetch(`${STRAPI_URL}/api/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to create lesson');
    }

    revalidatePath(`/dashboard/courses/${courseDocumentId}`);
    redirect(`/dashboard/courses/${courseDocumentId}`);
}

// ─── Update Lesson ────────────────────────────────────────────────────────────

export async function updateLessonAction(lessonDocumentId: string, courseDocumentId: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const payload: Record<string, unknown> = {
        title: formData.get('title'),
        videoUrl: formData.get('videoUrl') || undefined,
        videoProvider: formData.get('videoProvider') || undefined,
        duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
        order: Number(formData.get('order')) || 1,
        isFree: formData.get('isFree') === 'true',
    };
    if (formData.get('content')) {
        payload.content = [{ type: 'paragraph', children: [{ type: 'text', text: formData.get('content') }] }];
    }

    const res = await fetch(`${STRAPI_URL}/api/lessons/${lessonDocumentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to update lesson');
    }

    revalidatePath(`/dashboard/courses/${courseDocumentId}`);
    redirect(`/dashboard/courses/${courseDocumentId}`);
}

// ─── Delete Lesson ────────────────────────────────────────────────────────────

export async function deleteLessonAction(lessonDocumentId: string, courseDocumentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    await fetch(`${STRAPI_URL}/api/lessons/${lessonDocumentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
    });

    revalidatePath(`/dashboard/courses/${courseDocumentId}`);
    redirect(`/dashboard/courses/${courseDocumentId}`);
}
