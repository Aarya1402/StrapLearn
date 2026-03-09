import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
    /**
     * Override create:
     * - org_admin: quiz is auto-published immediately.
     * - instructor: quiz is saved as draft until approved by org_admin.
     */
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const isAdmin = user.role_type === 'org_admin';

        // Force create status based on role
        ctx.query = {
            ...ctx.query,
            status: isAdmin ? 'published' : 'draft',
        };

        const response: any = await super.create(ctx);
        return response;
    },

    /**
     * Publish a quiz via Document Service
     */
    async publish(ctx) {
        const { documentId } = ctx.params;
        try {
            const result = await strapi.documents('api::quiz.quiz').publish({
                documentId,
            });
            ctx.body = { data: result };
        } catch (error: any) {
            ctx.internalServerError(error?.message || 'Failed to publish quiz');
        }
    },

    /**
     * Unpublish a quiz via Document Service
     */
    async unpublish(ctx) {
        const { documentId } = ctx.params;
        try {
            const result = await strapi.documents('api::quiz.quiz').unpublish({
                documentId,
            });
            ctx.body = { data: result };
        } catch (error: any) {
            ctx.internalServerError(error?.message || 'Failed to unpublish quiz');
        }
    },

    async submit(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const { documentId } = ctx.params;
        const { answers } = ctx.request.body; // Map: questionDocumentId -> answer string

        if (!answers) return ctx.badRequest('Answers are required');

        // Fetch quiz with questions
        const quiz = await strapi.db.query('api::quiz.quiz').findOne({
            where: { documentId },
            populate: ['questions'],
        });

        if (!quiz) return ctx.notFound('Quiz not found');

        const questions = quiz.questions || [];
        let score = 0;
        let totalPoints = 0;

        const detailedResults = questions.map((q: any) => {
            const userAnswer = answers[q.documentId];
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) score += (q.points || 1);
            totalPoints += (q.points || 1);

            return {
                questionDocumentId: q.documentId,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                pointsText: `${isCorrect ? q.points : 0}/${q.points}`
            };
        });

        const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        const isPassed = percentage >= (quiz.passingScore || 70);

        // Save attempt
        const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
            data: {
                user: user.id,
                quiz: quiz.id,
                answers: detailedResults,
                score: percentage,
                isPassed,
                attemptedAt: new Date(),
            }
        });

        return {
            score: percentage,
            isPassed,
            passingScore: quiz.passingScore,
            detailedResults,
            attemptId: attempt.documentId
        };
    },

    async results(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const { documentId } = ctx.params;

        const attempts = await strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
            where: {
                user: { id: user.id },
                quiz: { documentId }
            },
            orderBy: { attemptedAt: 'desc' }
        });

        return { data: attempts };
    }
}));
