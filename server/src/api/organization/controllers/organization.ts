/**
 * organization controller — core CRUD + custom listInstructors action
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::organization.organization', ({ strapi }) => ({
    /**
     * GET /api/organizations/:id/instructors
     *
     * Returns all users with role_type = 'instructor' that belong to this
     * organization.  Only accessible by authenticated org_admin users.
     */
    async listInstructors(ctx: any) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized('Authentication required.');

        // Only org_admin (and super-admin) should call this endpoint
        if (user.role_type !== 'org_admin') {
            return ctx.forbidden('Only organization admins can list instructors.');
        }

        const { id: orgDocumentId } = ctx.params;

        // Look up the org by documentId so we have its numeric PK
        const org = await strapi.db.query('api::organization.organization').findOne({
            where: { documentId: orgDocumentId },
        });

        if (!org) return ctx.notFound('Organization not found.');

        // Fetch all instructors that belong to this org
        const instructors = await strapi.db.query('plugin::users-permissions.user').findMany({
            where: {
                role_type: 'instructor',
                organization: { id: org.id },
            },
            select: ['id', 'documentId', 'username', 'email'],
        });

        return ctx.send({ data: instructors });
    },
}));
