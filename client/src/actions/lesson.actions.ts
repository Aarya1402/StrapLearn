'use server';

import api from '@/lib/axios';
import { getCurrentJwt } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

    try {
        await api.post(`/lessons`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to create lesson');
    }

    revalidatePath(`/dashboard/courses/${courseDocumentId}`);
    redirect(`/dashboard/courses/${courseDocumentId}`);
}

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

    try {
        await api.put(`/lessons/${lessonDocumentId}`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to update lesson');
    }

    revalidatePath(`/dashboard/courses/${courseDocumentId}`);
    redirect(`/dashboard/courses/${courseDocumentId}`);
}

export async function deleteLessonAction(lessonDocumentId: string, courseDocumentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.delete(`/lessons/${lessonDocumentId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        // Silently ignore
    }

    revalidatePath(`/dashboard/courses/${courseDocumentId}`);
    redirect(`/dashboard/courses/${courseDocumentId}`);
}
