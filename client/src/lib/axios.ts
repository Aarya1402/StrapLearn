import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const api = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
