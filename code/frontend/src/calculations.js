export function formatCurrency(value) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

export function normalizeIntegerValue(value) {
	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue) || parsedValue < 0) {
		return 0;
	}
	return Math.trunc(parsedValue);
}

export function calculateItemTotal(quantity, price) {
	const parsedQuantity = Number(quantity) || 0;
	const parsedPrice = Number(price) || 0;
	return parsedQuantity * parsedPrice;
}

export function calculateOrderTotal(items) {
	return items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);
}
