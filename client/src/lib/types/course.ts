/**
 * MODULE 5 — Course Types
 */

export interface Category {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    icon?: string;
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
    publishedAt: string | null; // null = draft
    thumbnail?: { url: string };
    organization?: { id: number; documentId: string; name: string; slug: string };
    instructor?: { id: number; documentId: string; username: string; email: string };
    category?: Category;
}
