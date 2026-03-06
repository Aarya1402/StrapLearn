export default {
    routes: [
        { method: 'GET', path: '/courses', handler: 'course.find' },
        // Must be BEFORE /:id so 'my' is not treated as a documentId
        { method: 'GET', path: '/courses/my', handler: 'course.findMine' },
        { method: 'GET', path: '/courses/:id', handler: 'course.findOne' },
        { method: 'POST', path: '/courses', handler: 'course.create' },
        { method: 'PUT', path: '/courses/:id', handler: 'course.update' },
        { method: 'DELETE', path: '/courses/:id', handler: 'course.delete' },
        { method: 'POST', path: '/courses/:documentId/publish', handler: 'course.publish' },
        { method: 'POST', path: '/courses/:documentId/unpublish', handler: 'course.unpublish' },
    ],
};
