'use server';

import api from '@/lib/axios';
import { revalidatePath } from 'next/cache';
import { getCurrentJwt } from '@/lib/server-auth';

export async function markLessonCompleteAction(lessonId: string, courseId: string, courseSlug: string, lessonSlug: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        const res = await api.post(`/progress/mark-complete`, { lessonId, courseId }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });

        revalidatePath(`/courses/${courseSlug}/lessons/${lessonSlug}`);
        revalidatePath(`/courses/${courseSlug}`);

        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to mark lesson complete');
    }
}
