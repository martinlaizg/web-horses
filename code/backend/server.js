const path = require("node:path");
const express = require("express");

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;
const distributionDirectory = path.join(__dirname, "..", "frontend", "dist");

app.use(express.static(distributionDirectory));

app.get("/health", (_request, response) => {
	response.json({ status: "ok" });
});

if (require.main === module) {
	app.listen(port, () => {
		console.log(`Servidor web-horses escuchando en http://localhost:${port}`);
	});
}

module.exports = app;
