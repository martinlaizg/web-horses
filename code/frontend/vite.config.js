const path = require("node:path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
	root: __dirname,
	server: {
		proxy: {
			"/api": "http://localhost:3000",
		},
	},
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
});
