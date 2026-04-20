import api from './axios';
import type { LoginPayload, RegisterPayload, StrapiAuthResponse, StrapiUser } from './types/auth';

export async function login(payload: LoginPayload): Promise<StrapiAuthResponse> {
    try {
        const res = await api.post(`/auth/local`, payload);
        const authData = res.data;
        const fullUser = await getMe(authData.jwt);
        return { jwt: authData.jwt, user: fullUser };
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
}

export async function register(payload: RegisterPayload): Promise<StrapiAuthResponse> {
    try {
        const res = await api.post(`/auth/local/register-with-role`, payload);
        const authData = res.data;
        const fullUser = await getMe(authData.jwt);
        return { jwt: authData.jwt, user: fullUser };
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Registration failed');
    }
}

export async function getMe(jwt: string): Promise<StrapiUser> {
    try {
        const res = await api.get(`/users/me?populate=organization`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data;
    } catch (error) {
        throw new Error('Failed to fetch user');
    }
}

export async function getAllUsers(jwt: string, query?: string): Promise<StrapiUser[]> {
    let url = `/users?populate=organization`;
    
    if (query) {
        url += `&filters[$or][0][username][$containsi]=${encodeURIComponent(query)}`;
        url += `&filters[$or][1][email][$containsi]=${encodeURIComponent(query)}`;
    }

    try {
        const res = await api.get(url, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data;
    } catch (error) {
        throw new Error('Failed to fetch users');
    }
}

export async function getOrgUsers(jwt: string, organizationId: string, query?: string): Promise<StrapiUser[]> {
    let url = `/users?populate=organization&filters[organization][id][$eq]=${organizationId}`;
    
    if (query) {
        url += `&filters[$or][0][username][$containsi]=${encodeURIComponent(query)}`;
        url += `&filters[$or][1][email][$containsi]=${encodeURIComponent(query)}`;
    }

    try {
        const res = await api.get(url, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data;
    } catch (error) {
        throw new Error('Failed to fetch organization users');
    }
}

export function getDashboardPath(roleType: string): string {
    switch (roleType) {
        case 'super_admin':
            return '/dashboard/super';
        case 'org_admin':
            return '/dashboard/admin';
        case 'instructor':
            return '/dashboard/instructor';
        case 'student':
        default:
            return '/dashboard/student';
    }
}

export function isSuperAdmin(roleType?: string) {
    return roleType === 'super_admin';
}

export function isOrgAdmin(roleType?: string) {
    return roleType === 'org_admin' || roleType === 'super_admin';
}

export function isInstructor(roleType?: string) {
    return roleType === 'instructor' || roleType === 'org_admin' || roleType === 'super_admin';
}

export function isStudent(roleType?: string) {
    return roleType === 'student';
}

export async function updateUser(id: number, jwt: string, data: Partial<StrapiUser> & { password?: string }): Promise<StrapiUser> {
    try {
        const res = await api.put(`/users/${id}`, data, {
            headers: { 
                Authorization: `Bearer ${jwt}` 
            },
        });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Update failed');
    }
}
