const path = require("node:path");
const express = require("express");
const { createOrder, listOrders } = require("./database");

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;
const distributionDirectory = path.join(__dirname, "..", "frontend", "dist");

app.use(express.static(distributionDirectory));
app.use(express.json());

app.get("/health", (_request, response) => {
	response.json({ status: "ok" });
});

app.get("/api/orders", async (_request, response, next) => {
	try {
		response.json(await listOrders());
	} catch (error) {
		next(error);
	}
});

app.post("/api/orders", async (request, response, next) => {
	const { items, total } = request.body;
	if (!Array.isArray(items) || typeof total !== "number" || total < 0) {
		return response.status(400).json({ error: "Pedido no válido" });
	}

	try {
		response.status(201).json(await createOrder(items, total));
	} catch (error) {
		next(error);
	}
});

if (require.main === module) {
	app.listen(port, () => {
		console.log(`Servidor web-horses escuchando en http://localhost:${port}`);
	});
}

module.exports = app;
