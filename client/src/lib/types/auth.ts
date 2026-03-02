/**
 * MODULE 3 — Auth Types
 * Shared type definitions for authentication & RBAC.
 */

export type RoleType = 'org_admin' | 'instructor' | 'student';

export interface StrapiUser {
    id: number;
    username: string;
    email: string;
    role_type: RoleType;
    organization?: {
        id: number;
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
}

export interface StrapiAuthResponse {
    jwt: string;
    user: StrapiUser;
}
