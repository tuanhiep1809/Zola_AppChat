/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'chat.zalo.me',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'designs.vn',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'khanh2608-bucket01.s3.ap-southeast-1.amazonaws.com',
                port: '',
                pathname: '/**'
            },
        ],
    },
    reactStrictMode: false,
}

module.exports = nextConfig
