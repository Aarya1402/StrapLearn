export default {
    routes: [
        {
            method: 'POST',
            path: '/quizzes/:documentId/submit',
            handler: 'quiz.submit',
            config: {
                policies: ['api::enrollment.is-enrolled'],
            },
        },
        {
            method: 'GET',
            path: '/quizzes/:documentId/results',
            handler: 'quiz.results',
            config: {
                policies: ['api::enrollment.is-enrolled'],
            },
        },
        {
            method: 'POST',
            path: '/quizzes/:documentId/publish',
            handler: 'quiz.publish',
        },
        {
            method: 'POST',
            path: '/quizzes/:documentId/unpublish',
            handler: 'quiz.unpublish',
        },
    ],
};
