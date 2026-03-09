'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentJwt } from '@/lib/server-auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function markLessonCompleteAction(lessonId: string, courseId: string, courseSlug: string, lessonSlug: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/progress/mark-complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ lessonId, courseId }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to mark lesson complete');
    }

    revalidatePath(`/courses/${courseSlug}/lessons/${lessonSlug}`);
    revalidatePath(`/courses/${courseSlug}`);
}
