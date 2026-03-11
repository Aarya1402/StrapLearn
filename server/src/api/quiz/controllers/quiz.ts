import { factories } from '@strapi/strapi';
import { evaluateAnswerWithGemini } from '../../../utils/gemini-grader';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
    /**
     * Override create:
     * - org_admin: quiz is auto-published immediately.
     * - instructor: quiz is saved as draft until approved by org_admin.
     */
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const isAdmin = user.role_type === 'org_admin' || user.role_type === 'super_admin';

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
            const result = await (strapi.documents('api::quiz.quiz') as any).publish({
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
            const result = await (strapi.documents('api::quiz.quiz') as any).unpublish({
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
        const quiz = await strapi.documents('api::quiz.quiz').findOne({
            documentId,
            populate: ['questions'],
        });

        if (!quiz) return ctx.notFound('Quiz not found');

        const questions = quiz.questions || [];
        let score = 0;
        let totalPoints = 0;

        // Evaluate each answer (short-answer → Gemini AI, mcq/true-false → exact match)
        const detailedResults = await Promise.all(questions.map(async (q: any) => {
            const userAnswer = answers[q.documentId] ?? '';
            const pointsValue = q.points || 1;
            totalPoints += pointsValue;

            const isShortAnswer = q.type === 'short-answer';

            let scoreMultiplier: number;
            let feedback: string | undefined;
            let missing_points: string[] | undefined;
            let aiResult: string | undefined;

            if (isShortAnswer) {
                // Use Gemini for semantic evaluation
                const evaluation = await evaluateAnswerWithGemini(
                    q.text,
                    q.correctAnswer,
                    userAnswer,
                );
                scoreMultiplier = evaluation.score;
                feedback = evaluation.feedback;
                missing_points = evaluation.missing_points;
                aiResult = evaluation.result;
            } else {
                // MCQ / true-false: exact string match (case-insensitive trim)
                const match = userAnswer.trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
                scoreMultiplier = match ? 1 : 0;
            }

            const pointsEarned = parseFloat((scoreMultiplier * pointsValue).toFixed(2));
            score += pointsEarned;
            const isCorrect = scoreMultiplier >= 1;
            const isPartial = scoreMultiplier > 0 && scoreMultiplier < 1;

            return {
                questionDocumentId: q.documentId,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                isPartial,
                scoreMultiplier,
                aiGraded: isShortAnswer,
                ...(isShortAnswer && { feedback, missing_points, aiResult }),
                pointsText: `${pointsEarned}/${pointsValue}`,
            };
        }));

        const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        const isPassed = percentage >= (quiz.passingScore || 70);

        // Save attempt
        const attempt = await strapi.documents('api::quiz-attempt.quiz-attempt').create({
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
