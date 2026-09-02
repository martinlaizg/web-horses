import { useMemo, useState } from "react";
import {
	calculateItemTotal,
	calculateOrderTotal,
	formatCurrency,
	normalizeIntegerValue,
} from "./calculations.js";

const initialItems = [
	{ key: "paja", name: "Paja", quantity: 0, price: 4.5 },
	{ key: "alfalfa", name: "Alfalfa", quantity: 0, price: 5.5 },
	{ key: "baio", name: "Baio", quantity: 0, price: 5 },
	{ key: "viruta", name: "Viruta", quantity: 0, price: 7 },
];

export default function App() {
	const [items, setItems] = useState(initialItems);
	const total = useMemo(() => calculateOrderTotal(items), [items]);

	function updateItem(key, field, value) {
		setItems((currentItems) =>
			currentItems.map((item) =>
				item.key === key ? { ...item, [field]: value } : item,
			),
		);
	}

	return (
		<main className="app">
			<section className="card">
				<header className="header">
					<p className="eyebrow">Suministros</p>
					<h1>Pedido para caballos</h1>
				</header>
				<div className="items" aria-label="Lista de productos">
					{items.map((item) => (
						<div className="item-row" data-item={item.key} key={item.key}>
							<label className="item-name" htmlFor={`${item.key}-cantidad`}>
								{item.name}
							</label>
							<div className="field">
								<label htmlFor={`${item.key}-cantidad`}>Cantidad</label>
								<input
									id={`${item.key}-cantidad`}
									type="number"
									min="0"
									step="1"
									inputMode="numeric"
									value={item.quantity}
									onChange={(event) =>
										updateItem(
											item.key,
											"quantity",
											normalizeIntegerValue(event.target.value),
										)
									}
								/>
							</div>
							<div className="field">
								<label htmlFor={`${item.key}-precio`}>Precio</label>
								<input
									id={`${item.key}-precio`}
									type="number"
									min="0"
									step="0.01"
									value={item.price}
									onChange={(event) =>
										updateItem(item.key, "price", event.target.value)
									}
								/>
							</div>
							<div className="item-total">
								<span>Total</span>
								<strong>{formatCurrency(calculateItemTotal(item.quantity, item.price))}</strong>
							</div>
						</div>
					))}
				</div>
				<div className="summary" aria-live="polite">
					<span>Total del pedido</span>
					<strong>{formatCurrency(total)}</strong>
				</div>
			</section>
		</main>
	);
}
