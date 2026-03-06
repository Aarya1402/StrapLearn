/**
 * MODULE 5 — Course Fetch Helpers (Server Components only)
 */

import type { Course, Category } from './types/course';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const COURSE_POPULATE =
    'populate[thumbnail]=true' +
    '&populate[organization]=true' +
    '&populate[instructor]=true' +
    '&populate[category]=true' +
    // Strapi v5: nested populate with sort must use array-index format.
    // 'populate[lessons][sort]=order:asc' is silently ignored because it
    // uses the object-style nested populate without declaring any fields.
    '&populate[lessons][sort][0]=order%3Aasc';

// ─── Public: published courses (tenant-filtered by org slug) ─────────────────

export async function getPublishedCourses(orgSlug?: string): Promise<Course[]> {
    // Strapi v5: use status=published (not publicationState=live which is v4)
    let url = `${STRAPI_URL}/api/courses?${COURSE_POPULATE}&status=published`;
    if (orgSlug) url += `&filters[organization][slug][$eq]=${orgSlug}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

// ─── Public: single published course by slug ─────────────────────────────────

export async function getCourseBySlug(slug: string): Promise<Course | null> {
    // Strapi v5: status=published for public access
    const res = await fetch(
        `${STRAPI_URL}/api/courses?filters[slug][$eq]=${slug}&${COURSE_POPULATE}&status=published`,
        { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0] ?? null;
}

// ─── Authenticated: all courses for instructor/admin dashboard ────────────────

export async function getAllCoursesForDashboard(
    jwt: string,
    orgSlug?: string,
): Promise<Course[]> {
    let baseUrl = `${STRAPI_URL}/api/courses?${COURSE_POPULATE}`;
    if (orgSlug) baseUrl += `&filters[organization][slug][$eq]=${orgSlug}`;

    // Strapi v5: endpoints return only published content by default.
    // Fetch published & drafts separately then combine.
    const [publishedRes, draftRes] = await Promise.all([
        fetch(`${baseUrl}&status=published`, { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' }),
        fetch(`${baseUrl}&status=draft`, { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' }),
    ]);

    const publishedData = publishedRes.ok ? await publishedRes.json() : { data: [] };
    const draftData = draftRes.ok ? await draftRes.json() : { data: [] };

    const publishedCourses: Course[] = publishedData.data ?? [];
    const draftCoursesRaw: Course[] = draftData.data ?? [];

    // Exclude draft entries whose documentId already has a published version.
    const publishedIds = new Set(publishedCourses.map(course => course.documentId));
    const draftCourses = draftCoursesRaw.filter(course => !publishedIds.has(course.documentId));

    const combined = [...publishedCourses, ...draftCourses];
    combined.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return combined;
}

// ─── Authenticated: courses belonging to the logged-in instructor ────────────
// Calls the custom GET /courses/my Strapi endpoint which uses strapi.db.query
// internally — bypassing the REST-API restriction on plugin::users-permissions.user
// relations (filtering/populating them via the content-type API is blocked by Strapi v5).

export async function getMyCourses(jwt: string): Promise<Course[]> {
    const res = await fetch(
        `${STRAPI_URL}/api/courses/my`,
        { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' }
    );
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

// ─── Org Instructors (org_admin only) ────────────────────────────────────────

export interface OrgInstructor {
    id: number;
    documentId: string;
    username: string;
    email: string;
}

/**
 * Fetches all instructors belonging to the given organization.
 * Only callable by an authenticated org_admin (JWT required).
 */
export async function getOrgInstructors(orgDocumentId: string, jwt: string): Promise<OrgInstructor[]> {
    const res = await fetch(
        `${STRAPI_URL}/api/organizations/${orgDocumentId}/instructors`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

