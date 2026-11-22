const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
	calculateItemTotal,
	calculateOrderTotal,
	formatCurrency,
	formatRelativeDate,
	normalizePriceValue,
} = require("../frontend/src/calculations.cjs");

assert.equal(normalizePriceValue("4.56"), 4.56);
assert.equal(normalizePriceValue("4.544"), 4.54);
assert.equal(normalizePriceValue("-1"), 0);
assert.equal(normalizePriceValue("invalid"), 0);
assert.equal(normalizePriceValue("4,56"), 4.56);
assert.equal(formatCurrency(4.5).includes("4.50"), true);
assert.equal(formatCurrency(4.5).includes("4,50"), false);

const now = new Date("2026-11-22T12:00:00Z");
assert.equal(formatRelativeDate("2026-11-19T12:00:00Z", now), "hace 3 días");
assert.equal(formatRelativeDate("2026-11-08T12:00:00Z", now), "hace 2 semanas");
assert.match(formatRelativeDate("2026-04-01T12:00:00Z", now), /abril|2026/i);

assert.equal(calculateItemTotal(2, 4.5), 9);
assert.equal(calculateItemTotal(0, 10), 0);
assert.equal(calculateOrderTotal([
	{ quantity: 2, price: 4.5, selected: true },
	{ quantity: 10, price: 100, selected: false },
]), 9);
assert.equal(
	calculateOrderTotal([
		{ quantity: 2, price: 4.5 },
		{ quantity: 3, price: 1.5 },
		{ quantity: 1, price: 2 },
		{ quantity: 5, price: 0.5 },
	]),
	9 + 4.5 + 2 + 2.5
);

test("SQLite elimina pedidos y administra suministros en una base temporal", async () => {
	const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "horses-test-"));
	process.env.DB_PATH = path.join(temporaryDirectory, "orders.db");

	const {
		createOrder,
		createSupply,
		deleteOrder,
		deleteSupply,
		updateOrder,
		listSupplies,
		updateSupply,
	} = require("./database");
	const order = await createOrder([{ key: "paja", name: "Paja", quantity: 2, price: 4.5 }], 9, "2026-06-15");
	assert.equal(order.created_at !== "2026-06-15T12:00:00.000Z", true);
	assert.equal(order.order_date, "2026-06-15");

	const originalCreatedAt = order.created_at;
	assert.equal(await updateOrder(order.id, [{ key: "paja", name: "Paja", quantity: 3, price: 4.5 }], 13.5, "2026-07-20"), true);
	const { listOrders } = require("./database");
	const updatedOrders = await listOrders();
	const updatedOrder = updatedOrders.find((item) => item.id === order.id);
	assert.equal(updatedOrder.created_at, originalCreatedAt);
	assert.equal(updatedOrder.order_date, "2026-07-20");
	assert.equal(updatedOrder.total, 13.5);
	assert.equal(updatedOrder.items[0].quantity, 3);

	assert.equal(await deleteOrder(order.id), true);
	assert.equal(await deleteOrder(order.id), false);

	const supply = await createSupply("Heno", 6.5);
	const supplies = await listSupplies();
	assert.equal(supply.name, "Heno");
	assert.equal(supply.defaultPrice, 6.5);
	assert.ok(supplies.some((item) => item.name === "Heno" && item.defaultPrice === 6.5));

	assert.equal(await updateSupply(supply.id, "Heno premium", 7.25), true);
	const updatedSupplies = await listSupplies();
	assert.ok(updatedSupplies.some((item) => item.id === supply.id && item.name === "Heno premium" && item.defaultPrice === 7.25));
	assert.equal(await deleteSupply(supply.id), true);
	assert.equal(await deleteSupply(supply.id), false);

	fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

console.log("Las pruebas del cálculo del pedido han pasado correctamente.");
