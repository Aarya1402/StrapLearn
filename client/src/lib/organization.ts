import api from './axios';
import type { StrapiUser } from './types/auth';

export interface Organization {
    id: number;
    documentId: string;  
    name: string;
    slug: string;
    primaryColor?: string;
    supportEmail?: string;
    isActive: boolean;
    logo?: { url: string };
    users?: StrapiUser[];
}

export async function getAllOrganizations(jwt: string, query?: string): Promise<Organization[]> {
    let url = `/organizations?populate=logo`;
    
    if (query) {
        url += `&filters[$or][0][name][$containsi]=${encodeURIComponent(query)}`;
        url += `&filters[$or][1][slug][$containsi]=${encodeURIComponent(query)}`;
    }

    try {
        const res = await api.get(url, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data;
    } catch (error) {
        throw new Error('Failed to fetch organizations');
    }
}

export async function getOrganizationById(documentId: string, jwt: string): Promise<Organization> {
    try {
        const res = await api.get(`/organizations/${documentId}?populate=logo`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data;
    } catch (error) {
        throw new Error('Failed to fetch organization');
    }
}

export async function getOrganizationBySlug(slug: string, jwt: string): Promise<Organization | null> {
    try {
        const res = await api.get(`/organizations?filters[slug][$eq]=${slug}&filters[isActive][$eq]=true`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data.data?.[0] ?? null;
    } catch (error) {
        return null;
    }
}

export async function getPublicOrganizations(): Promise<Organization[]> {
    try {
        const res = await api.get(`/organizations?filters[isActive][$eq]=true`);
        return res.data.data || [];
    } catch (error) {
        return [];
    }
}
