import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
    async markComplete(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized('You must be logged in.');

        const { lessonId, courseId } = ctx.request.body;

        if (!lessonId || !courseId) {
            return ctx.badRequest('lessonId and courseId are required.');
        }

        // Upsert progress record
        // Strapi document service or db query? README uses db.query.
        // In Strapi v5, db.query is still fine for bypass logic.
        const existing = await strapi.db.query('api::progress.progress').findOne({
            where: {
                user: { id: user.id },
                lesson: { documentId: lessonId }
            },
        });

        if (existing) {
            await strapi.db.query('api::progress.progress').update({
                where: { id: existing.id },
                data: { isCompleted: true, completedAt: new Date() },
            });
        } else {
            // Need numeric IDs for relation creation in db.query usually, 
            // but let's see if Strapi v5 documentIds work in db.query where clause and data.
            // Actually db.query often needs the numeric id for relations if not using documentId helpers.

            // Let's resolve numeric IDs just in case
            const lesson = await strapi.db.query('api::lesson.lesson').findOne({
                where: { documentId: lessonId }
            });
            const course = await strapi.db.query('api::course.course').findOne({
                where: { documentId: courseId }
            });

            if (!lesson || !course) {
                return ctx.notFound('Lesson or course not found.');
            }

            await strapi.db.query('api::progress.progress').create({
                data: {
                    user: user.id,
                    lesson: lesson.id,
                    course: course.id,
                    isCompleted: true,
                    completedAt: new Date(),
                },
            });
        }

        // Calculate overall course percentage
        const totalLessons = await strapi.db.query('api::lesson.lesson').count({
            where: { course: { documentId: courseId } },
        });

        const completedLessons = await strapi.db.query('api::progress.progress').count({
            where: {
                user: { id: user.id },
                course: { documentId: courseId },
                isCompleted: true
            },
        });

        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Auto-complete enrollment if 100%
        if (percentage === 100) {
            const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
                where: {
                    user: { id: user.id },
                    course: { documentId: courseId }
                },
                populate: ['course'] // Ensure course is populated to get the title
            });

            if (enrollment && !enrollment.isCompleted) {
                await strapi.db.query('api::enrollment.enrollment').update({
                    where: { id: enrollment.id },
                    data: { isCompleted: true, completedAt: new Date() },
                });

                // Create notification for the student
                await strapi.service('api::notification.notification').create({
                    data: {
                        user: user.id,
                        type: 'completion',
                        title: 'Course Completed! 🎓',
                        message: `Congratulations! You have successfully completed "${enrollment.course.title}".`,
                        link: `/dashboard/student/courses`,
                        isRead: false,
                    },
                });
            }
        }

        return { percentage, completedLessons, totalLessons };
    },

    async getCourseProgress(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized('You must be logged in.');

        const { courseId } = ctx.params;

        const totalLessons = await strapi.db.query('api::lesson.lesson').count({
            where: { course: { documentId: courseId } },
        });

        const completedLessons = await strapi.db.query('api::progress.progress').count({
            where: {
                user: { id: user.id },
                course: { documentId: courseId },
                isCompleted: true
            },
        });

        const completedLessonIds = await strapi.db.query('api::progress.progress').findMany({
            where: {
                user: { id: user.id },
                course: { documentId: courseId },
                isCompleted: true
            },
            populate: ['lesson']
        }).then(results => results.map((r: any) => r.lesson.documentId));

        return {
            percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            completedLessons,
            totalLessons,
            completedLessonIds
        };
    },
}));
