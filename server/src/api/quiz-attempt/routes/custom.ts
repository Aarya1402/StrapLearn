export default {
    routes: [
        {
            method: 'GET',
            path: '/quiz-attempts/:documentId/my',
            handler: 'quiz-attempt.myAttempt',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
