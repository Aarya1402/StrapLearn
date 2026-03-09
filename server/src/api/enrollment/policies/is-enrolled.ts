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

    const { id, courseId, lessonId: lessonIdParam } = policyContext.params;
    const { courseId: bodyCourseId, lessonId: bodyLessonId } = policyContext.request.body;

    let documentId = id || courseId || lessonIdParam || bodyCourseId || bodyLessonId;

    if (!documentId) return false;

    // Determination logic for which course we're talking about
    let courseDocumentId: string | null = null;

    // Check if we are dealing with a lesson or course
    const isLessonRoute =
        policyContext.state.route.handler.startsWith('api::lesson') ||
        lessonIdParam ||
        bodyLessonId;

    const isCourseRoute =
        policyContext.state.route.handler.startsWith('api::course') ||
        courseId ||
        bodyCourseId;

    if (isLessonRoute) {
        // If it's a progress route, it might pass lessonId. 
        // If it's a course route passing lessonId, logic still applies.
        const lessonDocId = lessonIdParam || bodyLessonId || documentId;
        const lesson = await strapi.db.query('api::lesson.lesson').findOne({
            where: { documentId: lessonDocId },
            populate: ['course'],
        });

        if (lesson?.isFree) return true;
        courseDocumentId = lesson?.course?.documentId;
    } else if (isCourseRoute) {
        courseDocumentId = courseId || bodyCourseId || documentId;
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
