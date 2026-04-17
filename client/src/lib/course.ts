/**
 * MODULE 5 — Course Fetch Helpers (Server Components only)
 */

import type { Course, Category, Quiz, Question } from './types/course';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const COURSE_POPULATE =
    'populate[thumbnail]=true' +
    '&populate[organization]=true' +
    '&populate[instructor]=true' +
    '&populate[category]=true' +
    '&populate[quizzes]=true' +
    // Strapi v5: nested populate with sort must use array-index format.
    // 'populate[lessons][sort]=order:asc' is silently ignored because it
    // uses the object-style nested populate without declaring any fields.
    '&populate[lessons][sort][0]=order%3Aasc';

// ... (other functions)

export async function getQuizById(documentId: string, jwt: string, includeDrafts: boolean = false): Promise<Quiz | null> {
    const statusQuery = includeDrafts ? '&status=draft' : '&status=published';
    const res = await fetch(
        `${STRAPI_URL}/api/quizzes/${documentId}?populate[questions]=true${statusQuery}`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
}

export async function getQuizAttempts(documentId: string, jwt: string): Promise<any[]> {
    const res = await fetch(
        `${STRAPI_URL}/api/quizzes/${documentId}/results`,
        {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

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

export async function searchCourses(params: {
    query?: string;
    level?: string;
    category?: string;
    isFree?: string;
    orgSlug?: string;
    sort?: string;
}): Promise<Course[]> {
    // Build parameters for the Strapi REST API
    const searchParams = new URLSearchParams();
    
    // Always populate required relations
    searchParams.append('populate[thumbnail]', 'true');
    searchParams.append('populate[organization]', 'true');
    searchParams.append('populate[category]', 'true');
    searchParams.append('status', 'published');

    // Applied Filters (Using Strapi Deep Filtering Syntax)
    if (params.query) {
        searchParams.append('filters[title][$containsi]', params.query);
    }
    
    if (params.level && params.level !== 'all') {
        searchParams.append('filters[level][$eq]', params.level);
    }
    
    if (params.category && params.category !== 'all') {
        searchParams.append('filters[category][slug][$eq]', params.category);
    }
    
    if (params.isFree === 'true') {
        searchParams.append('filters[isFree][$eq]', 'true');
    } else if (params.isFree === 'false') {
        searchParams.append('filters[isFree][$eq]', 'false');
    }
    
    if (params.orgSlug) {
        searchParams.append('filters[organization][slug][$eq]', params.orgSlug);
    }

    // Sorting
    if (params.sort === 'alphabetical') {
        searchParams.append('sort[0]', 'title:asc');
    } else {
        searchParams.append('sort[0]', 'publishedAt:desc');
    }

    const url = `${STRAPI_URL}/api/courses?${searchParams.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

// ─── Public: single published course by slug ─────────────────────────────────

export async function getCourseBySlug(slug: string, jwt?: string): Promise<Course | null> {
    // If JWT provided, fetch with status=draft to see the latest even if unpublished
    const statusQuery = jwt ? '&status=draft' : '&status=published';
    const headers: HeadersInit = jwt ? { Authorization: `Bearer ${jwt}` } : {};

    const res = await fetch(
        `${STRAPI_URL}/api/courses?filters[slug][$eq]=${slug}&${COURSE_POPULATE}${statusQuery}`,
        { 
            headers,
            cache: 'no-store' 
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0] ?? null;
}

// ─── Authenticated: all courses for instructor/admin dashboard ────────────────

export async function getAllCoursesForDashboard(
    jwt: string,
    orgSlug?: string,
    query?: string
): Promise<Course[]> {
    let baseUrl = `${STRAPI_URL}/api/courses?${COURSE_POPULATE}`;
    if (orgSlug) baseUrl += `&filters[organization][slug][$eq]=${orgSlug}`;
    if (query) baseUrl += `&filters[title][$containsi]=${encodeURIComponent(query)}`;

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

export async function getMyCourses(jwt: string, query?: string): Promise<Course[]> {
    let url = `${STRAPI_URL}/api/courses/my`;
    if (query) url += `?q=${encodeURIComponent(query)}`;

    const res = await fetch(
        url,
        { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

// ─── Authenticated: single course by documentId ──────────────────────────────

export async function getCourseById(documentId: string, jwt: string): Promise<Course | null> {
    const res = await fetch(
        `${STRAPI_URL}/api/courses/${documentId}?${COURSE_POPULATE}&status=draft`,
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

// ─── Enrollment (Student) ────────────────────────────────────────────────────

export async function getOrgEnrollmentStats(jwt: string): Promise<{
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
} | null> {
    const res = await fetch(`${STRAPI_URL}/api/enrollments/stats`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
}

export async function enrollInCourse(courseId: string, jwt: string): Promise<boolean> {
    const res = await fetch(`${STRAPI_URL}/api/enrollments/enroll`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
        cache: 'no-store',
    });

    if (!res.ok) {
        const error = await res.json();
        console.error('Enrollment failed:', error);
        return false;
    }

    return true;
}

export async function getMyEnrollments(jwt: string, query?: string): Promise<any[]> {
    let url = `${STRAPI_URL}/api/enrollments/me`;
    if (query) url += `?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

export async function checkEnrollment(courseId: string, jwt: string): Promise<boolean> {
    const enrollments = await getMyEnrollments(jwt);
    return enrollments.some((e: any) => e.course?.documentId === courseId);
}

export async function completeCourse(courseId: string, jwt: string): Promise<any> {
    const res = await fetch(`${STRAPI_URL}/api/enrollments/complete`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
        cache: 'no-store',
    });

    if (!res.ok) {
        const error = await res.json();
        console.error('Course completion failed:', error);
        return null;
    }

    return await res.json();
}

export async function getCourseProgress(courseDocumentId: string, jwt: string) {
    const res = await fetch(`${STRAPI_URL}/api/progress/course/${courseDocumentId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store'
    });
    if (!res.ok) return { percentage: 0, completedLessons: 0, totalLessons: 0, completedLessonIds: [] };
    return await res.json();
}

