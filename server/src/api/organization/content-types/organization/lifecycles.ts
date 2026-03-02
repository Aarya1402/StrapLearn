/**
 * MODULE 4 — Organization Lifecycle Hooks
 *
 * beforeCreate  → auto-generates slug from name if not provided
 * beforeUpdate  → keeps slug in sync when name changes
 */

import slugify from 'slugify';

export default {
    beforeCreate(event: any) {
        const { data } = event.params;
        if (data.name && !data.slug) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
    },

    beforeUpdate(event: any) {
        const { data } = event.params;
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
    },
};
