'use server';

import api from '@/lib/axios';
import { getCurrentJwt } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitQuizAction(quizDocumentId: string, answers: Record<string, string>, courseSlug: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        const res = await api.post(`/quizzes/${quizDocumentId}/submit`, { answers }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        revalidatePath(`/courses/${courseSlug}/quizzes/${quizDocumentId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to submit quiz');
    }
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

    let newQuizId: string | null = null;
    try {
        const res = await api.post(`/quizzes`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        newQuizId = res.data?.data?.documentId;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to create quiz');
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/courses/${courseSlug}`);

    if (newQuizId) {
        redirect(`/dashboard/courses/${courseId}/quizzes/${newQuizId}`);
    }
}

export async function publishQuizAction(quizDocumentId: string, courseId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.post(`/quizzes/${quizDocumentId}/publish`, { data: {} }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        revalidatePath(`/dashboard/courses/${courseId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to publish quiz');
    }
}

export async function deleteQuizAction(quizDocumentId: string, courseId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.delete(`/quizzes/${quizDocumentId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        revalidatePath(`/dashboard/courses/${courseId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to delete quiz');
    }
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

    try {
        await api.post(`/questions`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        revalidatePath(`/dashboard/courses/${courseId}`);
        revalidatePath(`/dashboard/courses/${courseId}/quizzes/${quizId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to create question');
    }
}

export async function deleteQuestionAction(questionDocumentId: string, courseId: string, quizId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.delete(`/questions/${questionDocumentId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        revalidatePath(`/dashboard/courses/${courseId}`);
        revalidatePath(`/dashboard/courses/${courseId}/quizzes/${quizId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to delete question');
    }
}

