export default {
    routes: [
        { method: 'GET', path: '/courses', handler: 'course.find' },
        { method: 'GET', path: '/courses/:id', handler: 'course.findOne' },
        { method: 'POST', path: '/courses', handler: 'course.create' },
        { method: 'PUT', path: '/courses/:id', handler: 'course.update' },
        { method: 'DELETE', path: '/courses/:id', handler: 'course.delete' },
    ],
};
