const ITEM_KEYS = ["paja", "alfalfa", "baio", "viruta"];

function formatCurrency(value) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function normalizeIntegerValue(value) {
	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue) || parsedValue < 0) {
		return 0;
	}
	return Math.trunc(parsedValue);
}

function calculateItemTotal(quantity, price) {
	const parsedQuantity = Number(quantity) || 0;
	const parsedPrice = Number(price) || 0;
	return parsedQuantity * parsedPrice;
}

function calculateOrderTotal(items) {
	return items.reduce((sum, item) => sum + calculateItemTotal(item.quantity, item.price), 0);
}

function updateTotals() {
	const items = ITEM_KEYS.map((key) => {
		const quantityInput = document.getElementById(`${key}-cantidad`);
		const priceInput = document.getElementById(`${key}-precio`);
		const totalOutput = document.getElementById(`${key}-total`);

		const quantity = Number(quantityInput.value) || 0;
		const price = Number(priceInput.value) || 0;
		const total = calculateItemTotal(quantity, price);

		totalOutput.textContent = formatCurrency(total);

		return {
			key,
			quantity,
			price,
			total,
		};
	});

	const generalTotal = calculateOrderTotal(items);
	document.getElementById("total-general").textContent = formatCurrency(generalTotal);
}

if (typeof document !== "undefined") {
	ITEM_KEYS.forEach((key) => {
		const quantityInput = document.getElementById(`${key}-cantidad`);
		const priceInput = document.getElementById(`${key}-precio`);

		quantityInput.addEventListener("input", () => {
			const normalized = normalizeIntegerValue(quantityInput.value);
			if (quantityInput.value !== String(normalized)) {
				quantityInput.value = normalized;
			}
			updateTotals();
		});

		priceInput.addEventListener("input", updateTotals);
	});

	updateTotals();
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		calculateItemTotal,
		calculateOrderTotal,
		formatCurrency,
	};
}
