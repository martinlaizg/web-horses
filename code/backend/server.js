const path = require("node:path");
const express = require("express");
const {
	createOrder,
	createSupply,
	deleteOrder,
	deleteSupply,
	updateOrder,
	listOrders,
	listSupplies,
	updateSupply,
} = require("./database");

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;
const distributionDirectory = path.join(__dirname, "..", "frontend", "dist");

app.use(express.static(distributionDirectory));
app.use(express.json());

app.get("/health", (_request, response) => {
	response.json({ status: "ok" });
});

app.get("/api/supplies", async (_request, response, next) => {
	try {
		response.json(await listSupplies());
	} catch (error) {
		next(error);
	}
});

app.post("/api/supplies", async (request, response, next) => {
	const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
	const defaultPrice = Number(request.body.defaultPrice);
	if (!name || !Number.isFinite(defaultPrice) || defaultPrice < 0) {
		return response.status(400).json({ error: "Suministro no válido" });
	}

	try {
		response.status(201).json(await createSupply(name, defaultPrice));
	} catch (error) {
		next(error);
	}
});

app.put("/api/supplies/:id", async (request, response, next) => {
	const id = Number(request.params.id);
	const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
	const defaultPrice = Number(request.body.defaultPrice);
	if (!Number.isInteger(id) || id < 1 || !name || !Number.isFinite(defaultPrice) || defaultPrice < 0) {
		return response.status(400).json({ error: "Suministro no válido" });
	}

	try {
		if (!(await updateSupply(id, name, defaultPrice))) {
			return response.status(404).json({ error: "Suministro no encontrado" });
		}
		response.json({ id, name, defaultPrice });
	} catch (error) {
		next(error);
	}
});

app.delete("/api/supplies/:id", async (request, response, next) => {
	const id = Number(request.params.id);
	if (!Number.isInteger(id) || id < 1) {
		return response.status(400).json({ error: "ID de suministro no válido" });
	}

	try {
		if (!(await deleteSupply(id))) {
			return response.status(404).json({ error: "Suministro no encontrado" });
		}
		response.status(204).end();
	} catch (error) {
		next(error);
	}
});

app.get("/api/orders", async (_request, response, next) => {
	try {
		response.json(await listOrders());
	} catch (error) {
		next(error);
	}
});

app.post("/api/orders", async (request, response, next) => {
	const { items, total, orderDate } = request.body;
	if (orderDate !== undefined) {
		const date = new Date(`${orderDate}T12:00:00.000Z`);
		if (
			!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)
			|| Number.isNaN(date.getTime())
			|| date.toISOString().slice(0, 10) !== orderDate
		) {
			return response.status(400).json({ error: "Fecha del pedido no válida" });
		}
	}
	const selectedItems = Array.isArray(items)
		? items.filter((item) => item?.selected !== false)
		: [];
	if (!Array.isArray(items) || typeof total !== "number" || total < 0) {
		return response.status(400).json({ error: "Pedido no válido" });
	}

	try {
		response.status(201).json(await createOrder(selectedItems, total, orderDate));
	} catch (error) {
		next(error);
	}
});

app.put("/api/orders/:id", async (request, response, next) => {
	const id = Number(request.params.id);
	const { items, total, orderDate } = request.body;
	if (!Number.isInteger(id) || id < 1 || !Array.isArray(items) || typeof total !== "number" || total < 0) {
		return response.status(400).json({ error: "Pedido no válido" });
	}
	if (orderDate !== undefined) {
		const date = new Date(`${orderDate}T12:00:00.000Z`);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== orderDate) {
			return response.status(400).json({ error: "Fecha del pedido no válida" });
		}
	}

	try {
		if (!(await updateOrder(id, items.filter((item) => item?.selected !== false), total, orderDate))) {
			return response.status(404).json({ error: "Pedido no encontrado" });
		}
		const orders = await listOrders();
		const updatedOrder = orders.find((order) => order.id === id);
		response.json(updatedOrder);
	} catch (error) {
		next(error);
	}
});

app.delete("/api/orders/:id", async (request, response, next) => {
	const id = Number(request.params.id);
	if (!Number.isInteger(id) || id < 1) {
		return response.status(400).json({ error: "ID de pedido no válido" });
	}

	try {
		if (!(await deleteOrder(id))) {
			return response.status(404).json({ error: "Pedido no encontrado" });
		}
		response.status(204).end();
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
