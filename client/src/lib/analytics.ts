const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getSystemOverview(jwt: string) {
  const res = await fetch(`${STRAPI_URL}/api/analytics/system-overview`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function getOrgOverview(jwt: string, orgSlug: string) {
  const res = await fetch(`${STRAPI_URL}/api/analytics/org-overview`, {
    headers: { 
      Authorization: `Bearer ${jwt}`,
      'x-org-slug': orgSlug
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function getCourseAnalytics(documentId: string, jwt: string, orgSlug: string) {
  const res = await fetch(`${STRAPI_URL}/api/analytics/course/${documentId}`, {
    headers: { 
      Authorization: `Bearer ${jwt}`,
      'x-org-slug': orgSlug
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function getStudentReport(userId: string, jwt: string, orgSlug: string) {
  const res = await fetch(`${STRAPI_URL}/api/analytics/student/${userId}`, {
    headers: { 
      Authorization: `Bearer ${jwt}`,
      'x-org-slug': orgSlug
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return await res.json();
}
