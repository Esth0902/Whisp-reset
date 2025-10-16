import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(process.cwd()),

    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination:
                    process.env.NODE_ENV === "development"
                        ? "http://localhost:4000/:path*" // backend local NestJS
                        : "https://whisp-reset-back.onrender.com/:path*", // backend Render
            },
        ];
    },
};

export default nextConfig;
