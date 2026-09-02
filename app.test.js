const assert = require("node:assert/strict");
const { calculateItemTotal, calculateOrderTotal } = require("./script.js");

assert.equal(calculateItemTotal(2, 4.5), 9);
assert.equal(calculateItemTotal(0, 10), 0);
assert.equal(
	calculateOrderTotal([
		{ quantity: 2, price: 4.5 },
		{ quantity: 3, price: 1.5 },
		{ quantity: 1, price: 2 },
		{ quantity: 5, price: 0.5 },
	]),
	9 + 4.5 + 2 + 2.5
);

console.log("Las pruebas del cálculo del pedido han pasado correctamente.");
