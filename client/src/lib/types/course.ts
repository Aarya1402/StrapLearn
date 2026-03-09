/**
 * MODULE 5/6 — Course & Lesson Types
 */

export interface Category {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    icon?: string;
}

export interface Lesson {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content?: any[];        // Strapi blocks format
    videoUrl?: string;
    videoProvider?: 'youtube' | 'vimeo' | 'upload';
    duration?: number;      // seconds
    order: number;
    isFree: boolean;
    course?: { documentId: string; title: string; slug: string };
}

export interface Course {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;       // minutes
    isFree: boolean;
    price?: number;
    publishedAt: string | null;
    updatedAt?: string;
    thumbnail?: { url: string };
    organization?: { id: number; documentId: string; name: string; slug: string };
    instructor?: { id: number; documentId: string; username: string; email: string };
    category?: Category;
    lessons?: Lesson[];
    quizzes?: Quiz[];
}

export interface Question {
    documentId: string;
    text: string;
    type: 'mcq' | 'true-false' | 'short-answer';
    options?: any;
    correctAnswer: string;
    points: number;
}

export interface Quiz {
    documentId: string;
    title: string;
    passingScore: number;
    timeLimit?: number;
    questions?: Question[];
}

export interface QuizAttempt {
    documentId: string;
    score: number;
    isPassed: boolean;
    attemptedAt: string;
    answers?: any[];
}
