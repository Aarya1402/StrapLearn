const { createStrapi } = require('@strapi/strapi');

async function test() {
    console.log("Starting strapi...");
    const app = createStrapi({ distDir: './dist' });
    await app.load();
    
    try {
        const courses = await app.documents('api::course.course').findMany({ status: 'published' });
        console.log("Published courses:", courses.length);
        if (courses.length > 0) {
            console.log("First:", courses[0].documentId);
            const result = await app.documents('api::course.course').unpublish({ documentId: courses[0].documentId });
            console.log("Result:", result);
        }
    } catch(err) {
        console.error("Error:", err);
    }
    process.exit(0);
}
test().catch(console.error);
