/**
 * is-enrolled policy
 * Checks if the user is enrolled in the course associated with the lesson/course being accessed.
 */
export default async (policyContext, config, { strapi }) => {
    const user = policyContext.state.user;
    if (!user) {
        return false;
    }

    console.log('[is-enrolled Policy] User:', user.id, user.role_type, user.documentId);
    console.log('[is-enrolled Policy] Params:', policyContext.params);
    console.log('[is-enrolled Policy] Request Body:', policyContext.request.body);
    console.log('[is-enrolled Policy] Handler:', policyContext.state.route.handler);

    // Allow Org Admins to see everything in their org
    if (user.role_type === 'org_admin') {
        console.log('[is-enrolled Policy] Org Admin bypass applied.');
        return true;
    }

    const { id, documentId: paramDocumentId, courseId, lessonId: lessonIdParam } = policyContext.params;
    const { courseId: bodyCourseId, lessonId: bodyLessonId } = policyContext.request.body;

    let documentId = id || paramDocumentId || courseId || lessonIdParam || bodyCourseId || bodyLessonId;

    if (!documentId) return false;

    // Determination logic for which course we're talking about
    let courseDocumentId: string | null = null;

    // Check if we are dealing with a lesson or course
    const isLessonRoute =
        policyContext.state.route.handler.toLowerCase().includes('lesson') ||
        lessonIdParam ||
        bodyLessonId;

    const isCourseRoute =
        policyContext.state.route.handler.toLowerCase().includes('course') ||
        courseId ||
        bodyCourseId;

    const isQuizRoute =
        policyContext.state.route.handler.toLowerCase().includes('quiz') ||
        policyContext.params.quizDocumentId;

    console.log('[is-enrolled Policy] Route Types:', { isLessonRoute, isCourseRoute, isQuizRoute });

    if (isLessonRoute) {
        // If it's a progress route, it might pass lessonId. 
        // If it's a course route passing lessonId, logic still applies.
        const lessonDocId = lessonIdParam || bodyLessonId || documentId;
        const lesson = await strapi.documents('api::lesson.lesson').findOne({
            documentId: lessonDocId,
            populate: ['course'],
        });

        if (lesson?.isFree) return true;
        courseDocumentId = lesson?.course?.documentId;
    } else if (isQuizRoute) {
        const quizDocId = policyContext.params.documentId || policyContext.params.quizDocumentId || documentId;
        const quiz = await strapi.db.query('api::quiz.quiz').findOne({
            where: { documentId: quizDocId },
            populate: ['course'],
        });
        courseDocumentId = quiz?.course?.documentId;
    } else if (isCourseRoute) {
        courseDocumentId = courseId || bodyCourseId || documentId;
    }

    if (!courseDocumentId) return false;

    // Fetch the course to check instructor
    const course = await strapi.documents('api::course.course').findOne({
        documentId: courseDocumentId,
        populate: ['instructor'],
    });

    if (!course) return false;

    // Allow Instructor of the course
    const isInstructor = user.role_type === 'instructor' && (
        (user.documentId && course.instructor?.documentId === user.documentId) ||
        (user.id && course.instructor?.id === user.id)
    );

    if (isInstructor) {
        console.log('[is-enrolled Policy] Instructor bypass applied.');
        return true;
    }

    // Check enrollment
    const enrollment = await strapi.documents('api::enrollment.enrollment').findMany({
        filters: {
            user: { id: user.id },
            course: { documentId: courseDocumentId },
        },
    });

    return enrollment.length > 0;
};
