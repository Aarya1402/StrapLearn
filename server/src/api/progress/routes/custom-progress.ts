export default {
    routes: [
        {
            method: 'POST',
            path: '/progress/mark-complete',
            handler: 'progress.markComplete',
            config: {
                // We'll use the enrollment policy to ensure the user is enrolled
                policies: ['api::enrollment.is-enrolled'],
            },
        },
        {
            method: 'GET',
            path: '/progress/course/:courseId',
            handler: 'progress.getCourseProgress',
            config: {
                policies: ['api::enrollment.is-enrolled'],
            },
        },
    ],
};
