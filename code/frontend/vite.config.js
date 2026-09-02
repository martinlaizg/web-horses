const path = require("node:path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
	root: __dirname,
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
});
