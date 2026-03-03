export default {
    routes: [
        { method: 'GET', path: '/categories', handler: 'category.find' },
        { method: 'GET', path: '/categories/:id', handler: 'category.findOne' },
        { method: 'POST', path: '/categories', handler: 'category.create' },
        { method: 'PUT', path: '/categories/:id', handler: 'category.update' },
    ],
};
