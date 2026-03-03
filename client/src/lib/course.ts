/**
 * MODULE 5 — Course Fetch Helpers (Server Components only)
 */

import type { Course, Category } from './types/course';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const COURSE_POPULATE = 'populate[thumbnail]=true&populate[organization]=true&populate[instructor]=true&populate[category]=true';

// ─── Public: published courses (tenant-filtered by org slug) ─────────────────

export async function getPublishedCourses(orgSlug?: string): Promise<Course[]> {
    let url = `${STRAPI_URL}/api/courses?${COURSE_POPULATE}&publicationState=live`;
    if (orgSlug) url += `&filters[organization][slug][$eq]=${orgSlug}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

// ─── Public: single published course by slug ─────────────────────────────────

export async function getCourseBySlug(slug: string): Promise<Course | null> {
    const res = await fetch(
        `${STRAPI_URL}/api/courses?filters[slug][$eq]=${slug}&${COURSE_POPULATE}&publicationState=live`,
        { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0] ?? null;
}

// ─── Authenticated: all courses for instructor/admin dashboard ────────────────

export async function getAllCoursesForDashboard(jwt: string, orgSlug?: string): Promise<Course[]> {
    let url = `${STRAPI_URL}/api/courses?${COURSE_POPULATE}&publicationState=preview`;
    if (orgSlug) url += `&filters[organization][slug][$eq]=${orgSlug}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

// ─── Authenticated: single course by documentId ──────────────────────────────

export async function getCourseById(documentId: string, jwt: string): Promise<Course | null> {
    const res = await fetch(
        `${STRAPI_URL}/api/courses/${documentId}?${COURSE_POPULATE}`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${STRAPI_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}
