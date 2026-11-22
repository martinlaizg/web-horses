const fs = require("node:fs");
const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();

const databasePath =
	process.env.DB_PATH || path.join(__dirname, "data", "orders.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new sqlite3.Database(databasePath);

const databaseReady = new Promise((resolve, reject) => {
	database.exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			items TEXT NOT NULL,
			total REAL NOT NULL,
			created_at TEXT NOT NULL,
			order_date TEXT
		);

		CREATE TABLE IF NOT EXISTS supplies (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			key TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			default_price REAL NOT NULL
		);

		INSERT OR IGNORE INTO supplies (key, name, default_price) VALUES
			('paja', 'Paja', 4.5),
			('alfalfa', 'Alfalfa', 5.5),
			('baio', 'Baio', 5),
			('viruta', 'Viruta', 7);
	`, (error) => {
		if (error) return reject(error);
		database.all("PRAGMA table_info(orders)", (pragmaError, columns) => {
			if (pragmaError) return reject(pragmaError);
			const hasOrderDate = columns.some((column) => column.name === "order_date");
			if (hasOrderDate) {
				database.run(
					"UPDATE orders SET order_date = substr(created_at, 1, 10) WHERE order_date IS NULL",
					(updateError) => updateError ? reject(updateError) : resolve(),
				);
				return;
			}
			database.run("ALTER TABLE orders ADD COLUMN order_date TEXT", (alterError) => {
				if (alterError) return reject(alterError);
				database.run(
					"UPDATE orders SET order_date = substr(created_at, 1, 10)",
					(updateError) => updateError ? reject(updateError) : resolve(),
				);
			});
		});
	});
});

function listOrders() {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		database.all(
			"SELECT id, items, total, created_at, order_date FROM orders ORDER BY id DESC",
			(error, rows) => {
				if (error) return reject(error);
				resolve(rows.map((row) => ({
					...row,
					items: JSON.parse(row.items),
					order_date: row.order_date || row.created_at,
				})));
			},
		);
	}));
}

function createOrder(items, total, orderDate) {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		const createdAt = new Date().toISOString();
		const persistedOrderDate = orderDate || createdAt.slice(0, 10);
		database.run(
			"INSERT INTO orders (items, total, created_at, order_date) VALUES (?, ?, ?, ?)",
			[JSON.stringify(items), total, createdAt, persistedOrderDate],
			function (error) {
				if (error) return reject(error);
				resolve({
					id: this.lastID,
					items,
					total,
					created_at: createdAt,
					order_date: persistedOrderDate,
				});
			},
		);
	}));
}

function updateOrder(id, items, total, orderDate) {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		database.run(
			"UPDATE orders SET items = ?, total = ?, order_date = ? WHERE id = ?",
			[JSON.stringify(items), total, orderDate, id],
			function (error) {
				if (error) return reject(error);
				resolve(this.changes > 0);
			},
		);
	}));
}

function deleteOrder(id) {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		database.run("DELETE FROM orders WHERE id = ?", [id], function (error) {
			if (error) return reject(error);
			resolve(this.changes > 0);
		});
	}));
}

function listSupplies() {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		database.all(
			"SELECT id, key, name, default_price FROM supplies ORDER BY id ASC",
			(error, rows) => {
				if (error) return reject(error);
				resolve(rows.map((row) => ({
					id: row.id,
					key: row.key,
					name: row.name,
					defaultPrice: row.default_price,
				})));
			},
		);
	}));
}

function createSupply(name, defaultPrice) {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		const keyBase = name
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "") || "suministro";
		const key = `${keyBase}-${Date.now().toString(36)}`;
		database.run(
			"INSERT INTO supplies (key, name, default_price) VALUES (?, ?, ?)",
			[key, name, defaultPrice],
			function (error) {
				if (error) return reject(error);
				resolve({ id: this.lastID, key, name, defaultPrice });
			},
		);
	}));
}

function updateSupply(id, name, defaultPrice) {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		database.run(
			"UPDATE supplies SET name = ?, default_price = ? WHERE id = ?",
			[name, defaultPrice, id],
			function (error) {
				if (error) return reject(error);
				resolve(this.changes > 0);
			},
		);
	}));
}

function deleteSupply(id) {
	return databaseReady.then(() => new Promise((resolve, reject) => {
		database.run("DELETE FROM supplies WHERE id = ?", [id], function (error) {
			if (error) return reject(error);
			resolve(this.changes > 0);
		});
	}));
}

module.exports = {
	listOrders,
	createOrder,
	updateOrder,
	deleteOrder,
	listSupplies,
	createSupply,
	updateSupply,
	deleteSupply,
};
