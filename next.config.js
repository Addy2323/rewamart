/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'rewamart.com',
            },
            {
                protocol: 'https',
                hostname: 'www.avesafya-oil.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
    },
    env: {
        CUSTOM_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
}

module.exports = nextConfig
