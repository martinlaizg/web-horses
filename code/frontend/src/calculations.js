export function formatCurrency(value) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "EUR",
		currencyDisplay: "narrowSymbol",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

export function getOrderDate(order) {
	return order?.order_date || order?.order_date_iso || order?.created_at || "";
}

export function formatFullDate(value) {
	const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
		? new Date(`${value}T12:00:00`)
		: new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	return new Intl.DateTimeFormat("es-ES", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
}

export function formatRelativeDate(value, now = new Date()) {
	const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
		? new Date(`${value}T12:00:00`)
		: new Date(value);
	if (Number.isNaN(date.getTime()) || Number.isNaN(now.getTime())) {
		return "Fecha desconocida";
	}

	const elapsedMilliseconds = now.getTime() - date.getTime();
	const elapsedDays = elapsedMilliseconds / (24 * 60 * 60 * 1000);

	if (Math.abs(elapsedDays) > 182.5) {
		return formatFullDate(date);
	}

	const rtf = new Intl.RelativeTimeFormat("es-ES", { numeric: "always" });
	const direction = elapsedMilliseconds > 0 ? -1 : 1;
	const elapsedMinutes = Math.abs(elapsedMilliseconds) / (60 * 1000);
	const elapsedHours = elapsedMinutes / 60;
	const absoluteElapsedDays = Math.abs(elapsedDays);

	if (elapsedMinutes < 1) return "ahora";
	if (elapsedHours < 1) return rtf.format(direction * Math.round(elapsedMinutes), "minute");
	if (absoluteElapsedDays < 1) return rtf.format(direction * Math.round(elapsedHours), "hour");
	if (absoluteElapsedDays < 7) return rtf.format(direction * Math.floor(absoluteElapsedDays), "day");
	if (absoluteElapsedDays < 30) return rtf.format(direction * Math.floor(absoluteElapsedDays / 7), "week");
	return rtf.format(direction * Math.floor(absoluteElapsedDays / 30.436875), "month");
}

export function normalizeIntegerValue(value) {
	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue) || parsedValue < 0) {
		return 0;
	}
	return Math.trunc(parsedValue);
}

export function formatPriceInput(value) {
	const normalizedValue = String(value).trim().replace(/,/g, ".");
	const parsedValue = Number(normalizedValue);
	if (!Number.isFinite(parsedValue) || parsedValue < 0) {
		return "0.00";
	}
	return parsedValue.toFixed(2);
}

export function normalizePriceValue(value) {
	const normalizedValue = String(value).trim().replace(/,/g, ".");
	const parsedValue = Number(normalizedValue);
	if (!Number.isFinite(parsedValue) || parsedValue < 0) {
		return 0;
	}
	return Math.round(parsedValue * 100) / 100;
}

export function calculateItemTotal(quantity, price) {
	const parsedQuantity = Number(quantity) || 0;
	const parsedPrice = Number(price) || 0;
	return parsedQuantity * parsedPrice;
}

export function calculateOrderTotal(items) {
	return items.reduce((sum, item) => {
		if (item.selected === false) return sum;
		return sum + calculateItemTotal(item.quantity, item.price);
	}, 0);
}
