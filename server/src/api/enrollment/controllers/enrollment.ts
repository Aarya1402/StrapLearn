import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
    /**
     * POST /api/enrollments/enroll
     * Enrolls the authenticated user in a course by courseId (documentId).
     */
    async enroll(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to enroll.');
        }

        const { courseId } = ctx.request.body;
        if (!courseId) {
            return ctx.badRequest('courseId is required.');
        }

        // Check if course exists
        const course = await strapi.db.query('api::course.course').findOne({
            where: { documentId: courseId },
        });

        if (!course) {
            return ctx.notFound('Course not found.');
        }

        // Check if already enrolled
        const existingEnrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
            where: {
                user: { id: user.id },
                course: { id: course.id },
            },
        });

        if (existingEnrollment) {
            // return ctx.badRequest('You are already enrolled in this course.');
            // return 200 to be idempotent
            return (ctx.body = { data: existingEnrollment });
        }

        // Create enrollment
        const enrollment = await strapi.db.query('api::enrollment.enrollment').create({
            data: {
                user: user.id,
                course: course.id,
                enrolledAt: new Date(),
                // isCompleted: false (defaulted in schema)
            },
            populate: ['course'],
        });

        return (ctx.body = { data: enrollment });
    },

    /**
     * GET /api/enrollments/me
     * Returns all courses enrolled by the current user.
     */
    async getMyEnrollments(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
            where: { user: { id: user.id } },
            populate: {
                course: {
                    populate: ['thumbnail', 'organization', 'quizzes']
                }
            },
            orderBy: { enrolledAt: 'desc' },
        });

        return (ctx.body = { data: enrollments });
    },

    /**
     * POST /api/enrollments/complete
     * Marks a course as completed for the authenticated user.
     */
    async complete(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in.');
        }

        const { courseId } = ctx.request.body;
        if (!courseId) {
            return ctx.badRequest('courseId is required.');
        }

        // Find the enrollment
        const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
            where: {
                user: { id: user.id },
                course: { documentId: courseId },
            },
        });

        if (!enrollment) {
            return ctx.notFound('Enrollment not found.');
        }

        // Update enrollment
        const updatedEnrollment = await strapi.db.query('api::enrollment.enrollment').update({
            where: { id: enrollment.id },
            data: {
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        // Check for quizzes
        const publishedQuizzes = await strapi.documents('api::quiz.quiz').findMany({
            filters: { course: { documentId: courseId } },
            status: 'published',
            limit: 1
        });

        const nextQuizId = publishedQuizzes.length > 0 ? publishedQuizzes[0].documentId : null;

        return (ctx.body = { data: updatedEnrollment, nextQuizId });
    },

    /**
     * GET /api/enrollments/stats
     * Returns completion rate stats scoped to the admin's organization.
     * Accessible by org_admin only.
     */
    async getOrgStats(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        // Fetch user with organization populated
        const userWithOrg = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: user.id },
            populate: ['organization'],
        }) as any;

        const orgId = userWithOrg?.organization?.id;
        if (!orgId) return ctx.badRequest('No organization assigned.');

        // All enrollments for courses in this org
        const totalEnrollments = await strapi.db.query('api::enrollment.enrollment').count({
            where: { course: { organization: { id: orgId } } },
        });

        const completedEnrollments = await strapi.db.query('api::enrollment.enrollment').count({
            where: { course: { organization: { id: orgId } }, isCompleted: true },
        });

        const completionRate = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        return ctx.body = {
            totalEnrollments,
            completedEnrollments,
            completionRate,
        };
    },
}));
