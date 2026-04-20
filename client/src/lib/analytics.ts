import api from './axios';

export async function getSystemOverview(jwt: string) {
  try {
    const res = await api.get(`/analytics/system-overview`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function getOrgOverview(jwt: string, orgSlug: string) {
  try {
    const res = await api.get(`/analytics/org-overview`, {
      headers: { 
        Authorization: `Bearer ${jwt}`,
        'x-org-slug': orgSlug
      },
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function getCourseAnalytics(documentId: string, jwt: string, orgSlug: string) {
  try {
    const res = await api.get(`/analytics/course/${documentId}`, {
      headers: { 
        Authorization: `Bearer ${jwt}`,
        'x-org-slug': orgSlug
      },
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function getStudentReport(userId: string, jwt: string, orgSlug: string) {
  try {
    const res = await api.get(`/analytics/student/${userId}`, {
      headers: { 
        Authorization: `Bearer ${jwt}`,
        'x-org-slug': orgSlug
      },
    });
    return res.data;
  } catch (error) {
    return null;
  }
}
