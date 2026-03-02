import type { Core } from '@strapi/strapi';

// Routes that bypass tenant resolution (admin panel & auth endpoints)
const PUBLIC_ROUTES = ['/admin', '/_health', '/api/auth'];

/**
 * MODULE 2 — Multi-Tenant Middleware
 *
 * Reads the `x-org-slug` request header and resolves it to an Organization
 * record, attaching it to `ctx.state.organization` for use in controllers,
 * policies, and lifecycle hooks downstream.
 *
 * - If `x-org-slug` is present but not found in DB  → 401 Unauthorized
 * - If `x-org-slug` is absent                       → pass through (handled by policies)
 * - Admin / health / auth routes                    → always pass through
 * - Organization content type not yet created       → pass through safely (warns in log)
 */
const tenantResolver = (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
    return async (ctx: any, next: () => Promise<void>) => {
        const path: string = ctx.request.path;

        // Bypass tenant resolution for admin panel and health/auth routes
        const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));
        if (isPublicRoute) {
            return await next();
        }

        const orgSlug = ctx.request.headers['x-org-slug'] as string | undefined;

        // No slug provided — pass through; individual policies will enforce auth
        if (!orgSlug) {
            return await next();
        }

        // Guard: Organization content type may not exist yet during early development (before Module 4)
        // In Strapi v5, content types are accessed via strapi.db.metadata
        const hasOrgContentType = strapi.db.metadata.has('api::organization.organization');
        if (!hasOrgContentType) {
            strapi.log.warn(
                `[tenant-resolver] Organization content type not registered yet. ` +
                `Skipping tenant resolution for slug "${orgSlug}". ` +
                `Create the Organization content type (Module 4) to enable multi-tenancy.`
            );
            return await next();
        }

        // Look up org by slug — only active orgs are valid tenants
        const org = await strapi.db.query('api::organization.organization').findOne({
            where: { slug: orgSlug, isActive: true },
        });

        if (!org) {
            return ctx.unauthorized(`Unknown or inactive organization: "${orgSlug}"`);
        }

        // Attach resolved org to request state — available in all downstream handlers
        ctx.state.organization = org;

        await next();
    };
};

export default tenantResolver;
