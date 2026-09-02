import "./style.css";
import {
	calculateItemTotal,
	calculateOrderTotal,
	formatCurrency,
	normalizeIntegerValue,
} from "./calculations.js";

const ITEM_KEYS = ["paja", "alfalfa", "baio", "viruta"];

function updateTotals() {
	const items = ITEM_KEYS.map((key) => {
		const quantityInput = document.getElementById(`${key}-cantidad`);
		const priceInput = document.getElementById(`${key}-precio`);
		const totalOutput = document.getElementById(`${key}-total`);
		const quantity = Number(quantityInput.value) || 0;
		const price = Number(priceInput.value) || 0;
		const total = calculateItemTotal(quantity, price);

		totalOutput.textContent = formatCurrency(total);
		return { quantity, price };
	});

	document.getElementById("total-general").textContent = formatCurrency(
		calculateOrderTotal(items),
	);
}

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
