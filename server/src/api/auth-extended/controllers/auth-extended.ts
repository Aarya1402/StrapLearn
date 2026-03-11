/**
 * MODULE 3 — Custom Registration Controller
 *
 * Extends Strapi's default registration to accept `role_type`.
 * The default /api/auth/local/register ignores custom fields.
 *
 * Route: POST /api/auth/local/register-with-role
 */

import type { Core } from '@strapi/strapi';
import bcrypt from 'bcryptjs';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
    async registerWithRole(ctx: any) {
        const { username, email, password, role_type } = ctx.request.body;

        if (!username || !email || !password) {
            return ctx.badRequest('username, email and password are required');
        }

        const allowedRoles = ['super_admin', 'org_admin', 'instructor', 'student'];
        const resolvedRole = allowedRoles.includes(role_type) ? role_type : 'student';

        // Check registration is allowed
        const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
        const settings: any = await pluginStore.get({ key: 'advanced' });
        if (!settings.allow_register) {
            return ctx.forbidden('Registration is disabled');
        }

        // Check email uniqueness
        const existingUser = await strapi
            .query('plugin::users-permissions.user')
            .findOne({ where: { email } });
        if (existingUser) {
            return ctx.badRequest('Email is already taken');
        }

        // Get default Authenticated role
        const defaultRole = await strapi
            .query('plugin::users-permissions.role')
            .findOne({ where: { type: 'authenticated' } });

        // ✅ Hash the password using bcryptjs (same as Strapi internals use)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with hashed password
        const user = await strapi
            .query('plugin::users-permissions.user')
            .create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role: defaultRole?.id,
                    role_type: resolvedRole,
                    confirmed: true,
                    provider: 'local',
                },
            });

        // Issue JWT
        const jwt = strapi
            .plugin('users-permissions')
            .service('jwt')
            .issue({ id: user.id });

        return ctx.send({
            jwt,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role_type: user.role_type,
            },
        });
    },
});
