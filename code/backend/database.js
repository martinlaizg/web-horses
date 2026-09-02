const fs = require("node:fs");
const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();

const databasePath =
	process.env.DB_PATH || path.join(__dirname, "data", "orders.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new sqlite3.Database(databasePath);

database.run(`
	CREATE TABLE IF NOT EXISTS orders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		items TEXT NOT NULL,
		total REAL NOT NULL,
		created_at TEXT NOT NULL
	)
`);

function listOrders() {
	return new Promise((resolve, reject) => {
		database.all(
			"SELECT id, items, total, created_at FROM orders ORDER BY id DESC",
			(error, rows) => {
				if (error) return reject(error);
				resolve(rows.map((row) => ({ ...row, items: JSON.parse(row.items) })));
			},
		);
	});
}

function createOrder(items, total) {
	return new Promise((resolve, reject) => {
		const createdAt = new Date().toISOString();
		database.run(
			"INSERT INTO orders (items, total, created_at) VALUES (?, ?, ?)",
			[JSON.stringify(items), total, createdAt],
			function (error) {
				if (error) return reject(error);
				resolve({ id: this.lastID, items, total, created_at: createdAt });
			},
		);
	});
}

module.exports = { listOrders, createOrder };
