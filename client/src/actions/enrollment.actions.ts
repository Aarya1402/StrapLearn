'use server';

import { enrollInCourse, completeCourse } from '@/lib/course';
import { getCurrentJwt } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

export async function enrollAction(courseId: string, courseSlug: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) {
        throw new Error('Not authenticated');
    }

    const success = await enrollInCourse(courseId, jwt);
    if (success) {
        revalidatePath(`/courses/${courseSlug}`);
        return { success: true };
    }

    return { success: false, error: 'Failed to enroll' };
}

export async function completeCourseAction(courseId: string, courseSlug: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) {
        throw new Error('Not authenticated');
    }

    const res = await completeCourse(courseId, jwt);
    if (res && res.success) {
        revalidatePath(`/courses/${courseSlug}`);
        return { success: true, nextQuizId: res.nextQuizId };
    }

    return { success: false, error: res?.error || 'Failed to complete course' };
}
