import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
    /**
     * Override create:
     * - Automatically assigns instructor + organization from the authenticated user.
     * - org_admin: course is auto-published immediately (publishedAt is set).
     *   Can also designate a specific instructor from their org by passing
     *   `instructor` (documentId string) in the request body.
     * - instructor: course is saved as draft until approved by org_admin.
     */
    async create(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized('You must be logged in to create a course.');
        }

        const isAdmin = user.role_type === 'org_admin' || user.role_type === 'super_admin';

        // Capture requested instructor BEFORE we strip it from the body
        const requestedInstructorRaw = (ctx.request.body as any)?.data?.instructor ?? null;

        // Fetch the full user with their organization relation
        const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: user.id },
            populate: ['organization'],
        });

        // Strapi v5 content-api validation rejects unknown relation keys in the
        // create body. Strip instructor/organization so super.create() stays
        // happy — we set them via entityService.update() on the created row.
        if (!ctx.request.body?.data) {
            ctx.request.body = { data: {} };
        }
        if ((ctx.request.body as any).data?.instructor !== undefined)
            delete (ctx.request.body as any).data.instructor;
        if ((ctx.request.body as any).data?.organization !== undefined)
            delete (ctx.request.body as any).data.organization;

        // Force Strapi Document Service to create as draft if user is instructor
        // By default, Strapi v5 REST API creates as published. 
        ctx.query = {
            ...ctx.query,
            status: isAdmin ? 'published' : 'draft',
        };

        // Run the standard Strapi create
        const response: any = await super.create(ctx);

        // Strapi v5: super.create() sets ctx.body; the return value may be undefined.
        // We read from both to reliably get the created record's numeric id.
        const createdId: number | null =
            response?.data?.id ?? (ctx.body as any)?.data?.id ?? null;

        const organizationId: number | null = fullUser?.organization?.id ?? null;

        // ── Resolve which instructor to assign ────────────────────────────────
        // Default: the person creating the course (admin or instructor).
        let instructorIdToAssign: number = user.id;

        if (isAdmin && requestedInstructorRaw) {
            if (typeof requestedInstructorRaw === 'number') {
                instructorIdToAssign = requestedInstructorRaw;
            } else if (typeof requestedInstructorRaw === 'string' && requestedInstructorRaw.trim()) {
                const requestedUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                    where: { documentId: requestedInstructorRaw.trim() },
                });
                if (requestedUser?.id) {
                    instructorIdToAssign = requestedUser.id;
                }
            }
        }

        // ── Update relations in one DB call ──────────
        if (createdId && (instructorIdToAssign || organizationId)) {
            await strapi.entityService.update('api::course.course', createdId, {
                data: {
                    ...(instructorIdToAssign ? { instructor: instructorIdToAssign } : {}),
                    ...(organizationId ? { organization: organizationId } : {}),
                },
            });
        }

        return response;
    },

    /**
     * GET /courses/my
     * Returns all courses (published + drafts) where instructor = authenticated user.
     *
     * strapi.db.query bypasses the REST-API restriction that blocks filtering/populating
     * plugin::users-permissions.user relations through the content-type API.
     */
    async findMine(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized('You must be logged in.');

        const populate = {
            thumbnail: true,
            organization: true,
            category: true,
            lessons: { orderBy: { order: 'asc' } },
        };

        // Fetch published and draft versions in parallel
        const [published, drafts] = await Promise.all([
            strapi.db.query('api::course.course').findMany({
                where: { instructor: { id: user.id }, publishedAt: { $notNull: true } },
                populate,
            }),
            strapi.db.query('api::course.course').findMany({
                where: { instructor: { id: user.id }, publishedAt: null },
                populate,
            }),
        ]);

        // Exclude draft documents that already have a published version
        const publishedDocIds = new Set(published.map((c: any) => c.documentId));
        const uniqueDrafts = drafts.filter((c: any) => !publishedDocIds.has(c.documentId));

        const combined = [...published, ...uniqueDrafts].sort(
            (a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );

        ctx.body = { data: combined };
    },

    /**
     * Publish a course via Document Service
     */
    async publish(ctx) {
        const { documentId } = ctx.params;
        try {
            const result = await strapi.documents('api::course.course').publish({
                documentId,
            });
            ctx.body = { data: result };
        } catch (error: any) {
            console.error('Publish error:', error);
            ctx.internalServerError(error?.message || 'Failed to publish course');
        }
    },

    /**
     * Unpublish a course via Document Service
     */
    async unpublish(ctx) {
        const { documentId } = ctx.params;
        try {
            const result = await strapi.documents('api::course.course').unpublish({
                documentId,
            });
            ctx.body = { data: result };
        } catch (error: any) {
            console.error('Unpublish error:', error);
            ctx.internalServerError(error?.message || 'Failed to unpublish course');
        }
    },
}));
