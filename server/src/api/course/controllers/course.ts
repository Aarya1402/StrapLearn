import { factories } from '@strapi/strapi';
import fs from 'node:fs';

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

        const DEBUG_LOG_PATHS = [
            // Intended debug log path (may be unwritable depending on permissions)
            '/home/aarya/Internship_Projects/4_starpLearn/.cursor/debug-78d289.log',
            // Fallback: always-writable under repo
            '/home/aarya/Internship_Projects/4_starpLearn/server/debug-78d289.log',
        ];
        const SERVER_ENDPOINT =
            'http://127.0.0.1:7585/ingest/4afa9980-6400-4623-bd5a-eb1f6c49f197';

        const debugPost = (payload: any) => {
            // Best-effort local NDJSON so we have runtime evidence even if ingest is down.
            try {
                const line = JSON.stringify(payload) + '\n';
                for (const p of DEBUG_LOG_PATHS) {
                    try {
                        fs.appendFileSync(p, line, { encoding: 'utf8' });
                    } catch {
                        // swallow per-path failures (e.g. permissions)
                    }
                }
            } catch {
                // never break request handling
            }

            // Keep ingest posting as well (primary channel for the debug system).
            try {
                fetch(SERVER_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Debug-Session-Id': '78d289',
                    },
                    body: JSON.stringify(payload),
                }).catch(() => {});
            } catch {
                return Promise.resolve();
            }

            // Also print to Strapi logs (terminal evidence).
            try {
                // Avoid dumping full payload; message + key ids only.
                // eslint-disable-next-line no-console
                console.log('[course-debug]', payload?.hypothesisId, payload?.location, payload?.data);
            } catch {
                // ignore
            }
        };

        const isAdmin = user.role_type === 'org_admin' || user.role_type === 'super_admin';

        // #region agent log
        debugPost({
            sessionId: '78d289',
            runId: 'initial',
            hypothesisId: 'H2',
            location: 'server/src/api/course/controllers/course.ts:create:entry',
            message: 'Course create entry user context',
            data: {
                userId: user.id,
                role_type: user.role_type,
                isAdmin,
            },
            timestamp: Date.now(),
        });
        // #endregion agent log

        // Capture requested instructor BEFORE we strip it from the body
        const requestedInstructorRaw = (ctx.request.body as any)?.data?.instructor ?? null;

        // Fetch the full user with their organization relation
        const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: user.id },
            populate: ['organization'],
        });

        // #region agent log
        debugPost({
            sessionId: '78d289',
            runId: 'initial',
            hypothesisId: 'H1',
            location: 'server/src/api/course/controllers/course.ts:create:user-org',
            message: 'Resolved user organization for course create',
            data: {
                userId: user.id,
                hasOrganization: !!fullUser?.organization,
                organizationId: fullUser?.organization?.id ?? null,
            },
            timestamp: Date.now(),
        });
        // #endregion agent log

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

        // #region agent log
        debugPost({
            sessionId: '78d289',
            runId: 'initial',
            hypothesisId: 'H3',
            location: 'server/src/api/course/controllers/course.ts:create:pre-super',
            message: 'Request payload state before super.create',
            data: {
                requestedInstructorRaw,
                hasBodyInstructorKey: (ctx.request.body as any)?.data?.instructor !== undefined,
                hasBodyOrganizationKey: (ctx.request.body as any)?.data?.organization !== undefined,
                queryStatus: (ctx.query as any)?.status ?? null,
            },
            timestamp: Date.now(),
        });
        // #endregion agent log

        // Force Strapi Document Service to create as draft if user is instructor
        // By default, Strapi v5 REST API creates as published. 
        ctx.query = {
            ...ctx.query,
            status: isAdmin ? 'published' : 'draft',
        };

        // Run the standard Strapi create
        let response: any;
        try {
            response = await super.create(ctx);
        } catch (err: any) {
            // #region agent log
            debugPost({
                sessionId: '78d289',
                runId: 'initial',
                hypothesisId: 'H4',
                location: 'server/src/api/course/controllers/course.ts:create:super-error',
                message: 'super.create threw error',
                data: {
                    name: err?.name ?? null,
                    message: err?.message ?? null,
                    status: err?.status ?? null,
                },
                timestamp: Date.now(),
            });
            // #endregion agent log
            throw err;
        }

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
            try {
                await strapi.entityService.update('api::course.course', createdId, {
                    data: {
                        ...(instructorIdToAssign ? { instructor: instructorIdToAssign } : {}),
                        ...(organizationId ? { organization: organizationId } : {}),
                    },
                });
            } catch (err: any) {
                // #region agent log
                debugPost({
                    sessionId: '78d289',
                    runId: 'initial',
                    hypothesisId: 'H4',
                    location: 'server/src/api/course/controllers/course.ts:create:update-error',
                    message: 'entityService.update failed to set relations',
                    data: {
                        createdId,
                        instructorIdToAssign: instructorIdToAssign ?? null,
                        organizationId: organizationId ?? null,
                        name: err?.name ?? null,
                        message: err?.message ?? null,
                    },
                    timestamp: Date.now(),
                });
                // #endregion agent log
                throw err;
            }
        }

        // #region agent log
        debugPost({
            sessionId: '78d289',
            runId: 'initial',
            hypothesisId: 'H4',
            location: 'server/src/api/course/controllers/course.ts:create:success',
            message: 'Course created and relations assigned (post-update)',
            data: {
                createdId,
                instructorIdToAssign,
                organizationId,
            },
            timestamp: Date.now(),
        });
        // #endregion agent log

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

        const { q } = ctx.query as any;
        console.log('[Course Controller] findMine searching for:', q);

        const populateOpts: any = {
            thumbnail: true,
            organization: true,
            category: true,
            lessons: { sort: ['order:asc'] },
        };

        const baseFilters = { 
            instructor: { id: user.id },
            ...(q ? {
                $or: [
                    { title: { $containsi: q } },
                    { slug: { $containsi: q } },
                ]
            } : {})
        };

        // Fetch published and draft versions in parallel
        // Entity Service findMany supports filters and populate
        const [published, drafts] = await Promise.all([
            strapi.entityService.findMany('api::course.course', {
                filters: { ...baseFilters, publishedAt: { $notNull: true } },
                populate: populateOpts,
            }),
            strapi.entityService.findMany('api::course.course', {
                filters: { ...baseFilters, publishedAt: { $null: true } },
                populate: populateOpts,
            }),
        ]);

        const publishedDocs = published as any[];
        const draftDocs = drafts as any[];

        // Exclude draft documents that already have a published version
        const publishedDocIds = new Set(publishedDocs.map((c: any) => c.documentId));
        const uniqueDrafts = draftDocs.filter((c: any) => !publishedDocIds.has(c.documentId));

        const combined = [...publishedDocs, ...uniqueDrafts].sort(
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
