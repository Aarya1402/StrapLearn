/**
 * is-enrolled policy
 * Checks if the user is enrolled in the course associated with the lesson/course being accessed.
 */
export default async (policyContext, config, { strapi }) => {
    const user = policyContext.state.user;
    if (!user) {
        return false;
    }

    // Allow Org Admins to see everything in their org
    if (user.role_type === 'org_admin') {
        return true;
    }

    const { id: documentId } = policyContext.params;
    if (!documentId) return true;

    // We are protecting lessons and single course access
    // Determination logic for which course we're talking about
    let courseDocumentId: string | null = null;

    // If this is a lesson route
    if (policyContext.state.route.handler.startsWith('api::lesson')) {
        const lesson = await strapi.db.query('api::lesson.lesson').findOne({
            where: { documentId },
            populate: ['course'],
        });

        // If lesson is free, allow access
        if (lesson?.isFree) return true;

        courseDocumentId = lesson?.course?.documentId;
    }
    // If this is a course route
    else if (policyContext.state.route.handler.startsWith('api::course')) {
        courseDocumentId = documentId;
    }

    if (!courseDocumentId) return false;

    // Check enrollment
    const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
        where: {
            user: { id: user.id },
            course: { documentId: courseDocumentId },
        },
    });

    return !!enrollment;
};
