/**
 * MODULE 3 — Auth Types
 * Shared type definitions for authentication & RBAC.
 */

export type RoleType = 'super_admin' | 'org_admin' | 'instructor' | 'student';

export interface StrapiUser {
    id: number;
    documentId: string;          // Strapi v5: string UUID used in REST API relations
    username: string;
    email: string;
    role_type: RoleType;
    organization?: {
        id: number;
        documentId: string;
        name: string;
        slug: string;
    };
}

export interface AuthState {
    user: StrapiUser | null;
    jwt: string | null;
    isLoading: boolean;
}

export interface LoginPayload {
    identifier: string; // email or username
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    role_type?: RoleType;
    organization?: string; // documentId
}

export interface StrapiAuthResponse {
    jwt: string;
    user: StrapiUser;
}
