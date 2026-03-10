import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({
    async myAttempt(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const { documentId } = ctx.params;

        const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').findOne({
            where: {
                user: { id: user.id },
                documentId
            },
            populate: {
                quiz: {
                    populate: ['questions']
                }
            }
        });

        if (!attempt) return ctx.notFound();

        return { data: attempt };
    }
}));
