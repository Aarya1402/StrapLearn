import api from './axios';
import type { Course, Category, Quiz, Enrollment, QuizAttempt } from './types/course';

const COURSE_POPULATE =
    'populate[thumbnail]=true' +
    '&populate[organization]=true' +
    '&populate[instructor]=true' +
    '&populate[category]=true' +
    '&populate[quizzes]=true' +
    '&populate[lessons][sort][0]=order%3Aasc';

export async function getQuizById(documentId: string, jwt: string, includeDrafts: boolean = false): Promise<Quiz | null> {
    const statusQuery = includeDrafts ? '&status=draft' : '&status=published';
    try {
        const res = await api.get(`/quizzes/${documentId}?populate[questions]=true${statusQuery}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data ?? null;
    } catch (error) {
        return null;
    }
}

export async function getQuizAttempts(documentId: string, jwt: string): Promise<QuizAttempt[]> {
    try {
        const res = await api.get(`/quizzes/${documentId}/results`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

// ─── Public: published courses (tenant-filtered by org slug) ─────────────────

export async function getPublishedCourses(orgSlug?: string): Promise<Course[]> {
    let url = `/courses?${COURSE_POPULATE}&status=published`;
    if (orgSlug) url += `&filters[organization][slug][$eq]=${orgSlug}`;

    try {
        const res = await api.get(url);
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

export async function searchCourses(params: {
    query?: string;
    level?: string;
    category?: string;
    isFree?: string;
    orgSlug?: string;
    sort?: string;
}): Promise<Course[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('populate[thumbnail]', 'true');
    searchParams.append('populate[organization]', 'true');
    searchParams.append('populate[category]', 'true');
    searchParams.append('status', 'published');

    if (params.query) searchParams.append('filters[title][$containsi]', params.query);
    if (params.level && params.level !== 'all') searchParams.append('filters[level][$eq]', params.level);
    if (params.category && params.category !== 'all') searchParams.append('filters[category][slug][$eq]', params.category);
    
    if (params.isFree === 'true') {
        searchParams.append('filters[isFree][$eq]', 'true');
    } else if (params.isFree === 'false') {
        searchParams.append('filters[isFree][$eq]', 'false');
    }
    
    if (params.orgSlug) searchParams.append('filters[organization][slug][$eq]', params.orgSlug);

    if (params.sort === 'alphabetical') {
        searchParams.append('sort[0]', 'title:asc');
    } else {
        searchParams.append('sort[0]', 'publishedAt:desc');
    }

    try {
        const res = await api.get(`/courses?${searchParams.toString()}`);
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

// ─── Public: single published course by slug ─────────────────────────────────

export async function getCourseBySlug(slug: string, jwt?: string): Promise<Course | null> {
    const statusQuery = jwt ? '&status=draft' : '&status=published';
    const headers: any = jwt ? { Authorization: `Bearer ${jwt}` } : {};

    try {
        const res = await api.get(`/courses?filters[slug][$eq]=${slug}&${COURSE_POPULATE}${statusQuery}`, { headers });
        return res.data.data?.[0] ?? null;
    } catch (error) {
        return null;
    }
}

// ─── Authenticated: all courses for instructor/admin dashboard ────────────────

export async function getAllCoursesForDashboard(
    jwt: string,
    orgSlug?: string,
    query?: string
): Promise<Course[]> {
    let baseUrl = `/courses?${COURSE_POPULATE}`;
    if (orgSlug) baseUrl += `&filters[organization][slug][$eq]=${orgSlug}`;
    if (query) baseUrl += `&filters[title][$containsi]=${encodeURIComponent(query)}`;

    try {
        const [publishedRes, draftRes] = await Promise.all([
            api.get(`${baseUrl}&status=published`, { headers: { Authorization: `Bearer ${jwt}` } }),
            api.get(`${baseUrl}&status=draft`, { headers: { Authorization: `Bearer ${jwt}` } }),
        ]);

        const publishedCourses: Course[] = publishedRes.data.data ?? [];
        const draftCoursesRaw: Course[] = draftRes.data.data ?? [];

        const publishedIds = new Set(publishedCourses.map(course => course.documentId));
        const draftCourses = draftCoursesRaw.filter(course => !publishedIds.has(course.documentId));

        const combined = [...publishedCourses, ...draftCourses];
        combined.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        return combined;
    } catch (error) {
        return [];
    }
}

export async function getMyCourses(jwt: string, query?: string): Promise<Course[]> {
    let url = `/courses/my`;
    if (query) url += `?q=${encodeURIComponent(query)}`;

    try {
        const res = await api.get(url, { headers: { Authorization: `Bearer ${jwt}` } });
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

export async function getCourseById(documentId: string, jwt: string): Promise<Course | null> {
    try {
        const res = await api.get(`/courses/${documentId}?${COURSE_POPULATE}&status=draft`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data ?? null;
    } catch (error) {
        return null;
    }
}

export async function getCategories(): Promise<Category[]> {
    try {
        const res = await api.get(`/categories`);
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

export interface OrgInstructor {
    id: number;
    documentId: string;
    username: string;
    email: string;
}

export async function getOrgInstructors(orgDocumentId: string, jwt: string): Promise<OrgInstructor[]> {
    try {
        const res = await api.get(`/organizations/${orgDocumentId}/instructors`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

export async function getOrgEnrollmentStats(jwt: string): Promise<{
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
} | null> {
    try {
        const res = await api.get(`/enrollments/stats`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data;
    } catch (error) {
        return null;
    }
}

export async function enrollInCourse(courseId: string, jwt: string): Promise<boolean> {
    try {
        await api.post(`/enrollments/enroll`, { courseId }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return true;
    } catch (error) {
        console.error('Enrollment failed:', error);
        return false;
    }
}

export async function getMyEnrollments(jwt: string, query?: string): Promise<Enrollment[]> {
    let url = `/enrollments/me`;
    if (query) url += `?q=${encodeURIComponent(query)}`;

    try {
        const res = await api.get(url, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data ?? [];
    } catch (error) {
        return [];
    }
}

export async function checkEnrollment(courseId: string, jwt: string): Promise<boolean> {
    const enrollments = await getMyEnrollments(jwt);
    return enrollments.some((e) => e.course?.documentId === courseId);
}

export interface CompleteCourseResponse {
    success: boolean;
    nextQuizId?: string;
    error?: string;
}

export async function completeCourse(courseId: string, jwt: string): Promise<CompleteCourseResponse | null> {
    try {
        const res = await api.post(`/enrollments/complete`, { courseId }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data;
    } catch (error: any) {
        console.error('Course completion failed:', error.response?.data || error.message);
        return null;
    }
}

export async function getCourseProgress(courseDocumentId: string, jwt: string) {
    try {
        const res = await api.get(`/progress/course/${courseDocumentId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data;
    } catch (error) {
        return { percentage: 0, completedLessons: 0, totalLessons: 0, completedLessonIds: [] };
    }
}

