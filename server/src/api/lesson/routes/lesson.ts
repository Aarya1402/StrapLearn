export default {
    routes: [
        { method: 'GET', path: '/lessons', handler: 'lesson.find' },
        { method: 'GET', path: '/lessons/:id', handler: 'lesson.findOne' },
        { method: 'POST', path: '/lessons', handler: 'lesson.create' },
        { method: 'PUT', path: '/lessons/:id', handler: 'lesson.update' },
        { method: 'DELETE', path: '/lessons/:id', handler: 'lesson.delete' },
    ],
};
