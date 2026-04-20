'use server';

import api from '@/lib/axios';
import { getCurrentJwt } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function uploadLogo(file: File, jwt: string): Promise<number | null> {
    if (!file || file.size === 0) return null;

    const uploadForm = new FormData();
    uploadForm.append('files', file);

    try {
        const res = await api.post(`/upload`, uploadForm, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return res.data?.[0]?.id ?? null;
    } catch (error) {
        return null;
    }
}

export async function createOrganizationAction(formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const logoFile = formData.get('logo') as File | null;
    const logoId = logoFile && logoFile.size > 0 ? await uploadLogo(logoFile, jwt) : null;

    const payload: Record<string, unknown> = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || undefined,
        supportEmail: formData.get('supportEmail') || undefined,
        isActive: true,
    };
    if (logoId) payload.logo = logoId;

    try {
        await api.post(`/organizations`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to create organization');
    }

    revalidatePath('/dashboard/admin/organizations');
    redirect('/dashboard/admin/organizations');
}

export async function updateOrganizationAction(documentId: string, formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const logoFile = formData.get('logo') as File | null;
    const logoId = logoFile && logoFile.size > 0 ? await uploadLogo(logoFile, jwt) : null;

    const payload: Record<string, unknown> = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || undefined,
        supportEmail: formData.get('supportEmail') || undefined,
    };
    if (logoId) payload.logo = logoId;

    try {
        await api.put(`/organizations/${documentId}`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to update organization');
    }

    revalidatePath('/dashboard/admin/organizations');
    revalidatePath(`/dashboard/admin/organizations/${documentId}`);
    redirect('/dashboard/admin/organizations');
}

export async function deactivateOrganizationAction(documentId: string) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        await api.put(`/organizations/${documentId}`, { data: { isActive: false } }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error) {
        throw new Error('Failed to deactivate organization');
    }
    
    revalidatePath('/dashboard/admin/organizations');
    redirect('/dashboard/admin/organizations');
}

export async function updateOrgSuperAction(documentId: string, data: any) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    try {
        const res = await api.put(`/organizations/${documentId}`, { data }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        revalidatePath(`/dashboard/super/organizations`);
        revalidatePath(`/dashboard/super/organizations/${documentId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Update failed');
    }
}

export async function createOrgSuperAction(formData: FormData) {
    const jwt = await getCurrentJwt();
    if (!jwt) throw new Error('Unauthorized');

    const logoFile = formData.get('logo') as File | null;
    const logoId = logoFile && logoFile.size > 0 ? await uploadLogo(logoFile, jwt) : null;

    const payload: Record<string, unknown> = {
        name: formData.get('name'),
        primaryColor: formData.get('primaryColor') || '#111111',
        supportEmail: formData.get('supportEmail') || '',
        isActive: true,
    };
    if (logoId) payload.logo = logoId;

    try {
        await api.post(`/organizations`, { data: payload }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Failed to create organization');
    }

    revalidatePath('/dashboard/super/organizations');
    redirect('/dashboard/super/organizations');
}
