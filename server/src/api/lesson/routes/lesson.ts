export default {
    routes: [
        {
            method: 'GET',
            path: '/lessons',
            handler: 'lesson.find',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/lessons/:id',
            handler: 'lesson.findOne',
            config: {
                // Only allow enrolled users or org-admins to see private lessons
                policies: ['api::enrollment.is-enrolled'],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/lessons',
            handler: 'lesson.create',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'PUT',
            path: '/lessons/:id',
            handler: 'lesson.update',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'DELETE',
            path: '/lessons/:id',
            handler: 'lesson.delete',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
