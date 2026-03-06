/**
 * organization router — standard CRUD + custom instructor listing
 */
export default {
    routes: [
        { method: 'GET', path: '/organizations', handler: 'organization.find' },
        { method: 'GET', path: '/organizations/:id', handler: 'organization.findOne' },
        { method: 'POST', path: '/organizations', handler: 'organization.create' },
        { method: 'PUT', path: '/organizations/:id', handler: 'organization.update' },
        { method: 'DELETE', path: '/organizations/:id', handler: 'organization.delete' },
        /**
         * Custom route: GET /api/organizations/:id/instructors
         * Returns all users with role_type=instructor belonging to the given org.
         * Used by org_admin on the course-creation form to pick an instructor.
         */
        {
            method: 'GET',
            path: '/organizations/:id/instructors',
            handler: 'organization.listInstructors',
            config: { policies: [] },
        },
    ],
};
