function formatCurrency(value) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function calculateItemTotal(quantity, price) {
	const parsedQuantity = Number(quantity) || 0;
	const parsedPrice = Number(price) || 0;
	return parsedQuantity * parsedPrice;
}

function calculateOrderTotal(items) {
	return items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);
}

module.exports = { calculateItemTotal, calculateOrderTotal, formatCurrency };
