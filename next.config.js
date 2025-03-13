const { version } = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		version,
	},
	reactStrictMode: true,
	poweredByHeader: false,
	serverExternalPackages: ["@node-rs/argon2", "jsx-email"],
	images: {
		remotePatterns: [
			{
				hostname: "localhost",
			},
			{
				hostname: "images.unsplash.com",
			},
		],
	},
};

module.exports = nextConfig;
