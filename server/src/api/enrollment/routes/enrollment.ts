export default {
    routes: [
        {
            method: 'POST',
            path: '/enrollments/enroll',
            handler: 'enrollment.enroll',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/enrollments/me',
            handler: 'enrollment.getMyEnrollments',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/enrollments/complete',
            handler: 'enrollment.complete',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Include core routes (standard CRUD)
        {
            method: 'GET',
            path: '/enrollments',
            handler: 'enrollment.find',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/enrollments/:id',
            handler: 'enrollment.findOne',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/enrollments',
            handler: 'enrollment.create',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'PUT',
            path: '/enrollments/:id',
            handler: 'enrollment.update',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'DELETE',
            path: '/enrollments/:id',
            handler: 'enrollment.delete',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
