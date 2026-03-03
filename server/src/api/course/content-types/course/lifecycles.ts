import slugify from 'slugify';

export default {
    beforeCreate(event: any) {
        const { data } = event.params;
        if (data.title && !data.slug) {
            data.slug = slugify(data.title, { lower: true, strict: true });
        }
        if (data.price && data.isFree) {
            throw new Error('A free course cannot have a price.');
        }
    },
    beforeUpdate(event: any) {
        const { data } = event.params;
        if (data.title) {
            data.slug = slugify(data.title, { lower: true, strict: true });
        }
        if (data.price && data.isFree) {
            throw new Error('A free course cannot have a price.');
        }
    },
};
