import slugify from 'slugify';

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
const VIMEO_REGEX = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;

function validateVideoUrl(videoUrl: string) {
    const isValid = YOUTUBE_REGEX.test(videoUrl) || VIMEO_REGEX.test(videoUrl);
    if (!isValid) {
        throw new Error('Video URL must be a valid YouTube or Vimeo link.');
    }
}

export default {
    beforeCreate(event: any) {
        const { data } = event.params;
        // Auto-generate slug from title if not already set
        if (data.title && !data.slug) {
            data.slug = slugify(data.title, { lower: true, strict: true });
        }
        if (data.videoUrl) validateVideoUrl(data.videoUrl);
    },
    beforeUpdate(event: any) {
        const { data } = event.params;
        // Regenerate slug whenever title changes
        if (data.title) {
            data.slug = slugify(data.title, { lower: true, strict: true });
        }
        if (data.videoUrl) validateVideoUrl(data.videoUrl);
    },
};
