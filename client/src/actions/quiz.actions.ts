'use server';

import { getCurrentJwt } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function submitQuizAction(quizDocumentId: string, answers: Record<string, string>, courseSlug: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/quizzes/${quizDocumentId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to submit quiz', { cause: err });
    }

    const data = await res.json();
    revalidatePath(`/courses/${courseSlug}/quizzes/${quizDocumentId}`);
    return data;
}

export async function createQuizAction(courseId: string, courseSlug: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const payload = {
        title: formData.get('title'),
        passingScore: Number(formData.get('passingScore') || 70),
        timeLimit: formData.get('timeLimit') ? Number(formData.get('timeLimit')) : null,
        course: courseId,
    };

    const res = await fetch(`${STRAPI_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to create quiz');
    }

    const json = await res.json();
    const newQuizId = json?.data?.documentId;

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/courses/${courseSlug}`);

    if (newQuizId) {
        redirect(`/dashboard/courses/${courseId}/quizzes/${newQuizId}`);
    }
}

export async function publishQuizAction(quizDocumentId: string, courseId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/quizzes/${quizDocumentId}/publish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: {} }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to publish quiz');
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
}

export async function deleteQuizAction(quizDocumentId: string, courseId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/quizzes/${quizDocumentId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to delete quiz');
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
}

export async function createQuestionAction(quizId: string, courseId: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const optionsRaw = formData.get('options') as string;
    const options = optionsRaw ? optionsRaw.split(',').map(s => s.trim()) : [];

    const payload = {
        text: formData.get('text'),
        type: formData.get('type') || 'mcq',
        options,
        correctAnswer: formData.get('correctAnswer'),
        points: Number(formData.get('points') || 1),
        quiz: quizId,
    };

    const res = await fetch(`${STRAPI_URL}/api/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to create question');
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}/quizzes/${quizId}`);
}

export async function deleteQuestionAction(questionDocumentId: string, courseId: string, quizId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const res = await fetch(`${STRAPI_URL}/api/questions/${questionDocumentId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Failed to delete question');
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}/quizzes/${quizId}`);
}

