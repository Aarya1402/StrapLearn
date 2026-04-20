'use server';

import api from '@/lib/axios';
import { getCurrentJwt } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function uploadThumbnail(file: File, jwt: string): Promise<number | null> {
    if (!file || file.size === 0) return null;
    const form = new FormData();
    form.append('files', file);

    try {
        const res = await api.post(`/upload`, form, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data?.[0]?.id ?? null;
    } catch (error) {
        return null;
    }
}

export async function createCourseAction(formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const thumbnailFile = formData.get('thumbnail') as File | null;
    const thumbnailId = thumbnailFile && thumbnailFile.size > 0
        ? await uploadThumbnail(thumbnailFile, jwt) : null;

    const instructorId = (formData.get('instructorId') as string | null)?.trim() || undefined;

    const payload: Record<string, unknown> = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        isFree: formData.get('isFree') === 'true',
        price: formData.get('price') ? Number(formData.get('price')) : undefined,
        duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
        category: formData.get('categoryId') || undefined,
        ...(instructorId ? { instructor: instructorId } : {}),
    };
    if (thumbnailId) payload.thumbnail = thumbnailId;

    try {
        await api.post(`/courses`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        console.error('[createCourseAction] Axios error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Failed to create course');
    }

    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}

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

    try {
        await api.put(`/courses/${documentId}`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to update course');
    }

    revalidatePath('/dashboard/courses');
    revalidatePath(`/dashboard/courses/${documentId}`);
    redirect('/dashboard/courses');
}

export async function publishCourseAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.post(`/courses/${documentId}/publish`, { data: {} }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        console.error('Publish error from backend:', error.response?.data);
        throw new Error(error.response?.data?.error?.message || 'Failed to publish course');
    }
    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}

export async function unpublishCourseAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.post(`/courses/${documentId}/unpublish`, { data: {} }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        console.error('Unpublish error from backend:', error.response?.data);
        throw new Error(error.response?.data?.error?.message || 'Failed to unpublish course');
    }
    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}

export async function deleteCourseAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.delete(`/courses/${documentId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        // Silently ignore or handle deletion error if needed
    }

    revalidatePath('/dashboard/courses');
    redirect('/dashboard/courses');
}
