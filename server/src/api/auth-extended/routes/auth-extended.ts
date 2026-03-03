/**
 * MODULE 3 — Custom Auth Route
 * Registers the custom registration endpoint with role_type support.
 */

export default {
    routes: [
        {
            method: 'POST',
            path: '/auth/local/register-with-role',
            handler: 'auth-extended.registerWithRole',
            config: {
                auth: false, // public endpoint — no JWT needed to register
                prefix: '/api',
            },
        },
    ],
};
