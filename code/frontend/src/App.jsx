import { useEffect, useMemo, useState } from "react";
import {
	calculateItemTotal,
	calculateOrderTotal,
	formatCurrency,
	formatFullDate,
	formatPriceInput,
	getOrderDate,
	formatRelativeDate,
	normalizeIntegerValue,
	normalizePriceValue,
} from "./calculations.js";

const initialItems = [
	{ key: "paja", name: "Paja", quantity: 0, price: 4.5, selected: false },
	{ key: "alfalfa", name: "Alfalfa", quantity: 0, price: 5.5, selected: false },
	{ key: "baio", name: "Baio", quantity: 0, price: 5, selected: false },
	{ key: "viruta", name: "Viruta", quantity: 0, price: 7, selected: false },
];

export default function App() {
	const [items, setItems] = useState(initialItems);
	const [history, setHistory] = useState([]);
	const [supplies, setSupplies] = useState([]);
	const [activeView, setActiveView] = useState("order");
	const [supplyName, setSupplyName] = useState("");
	const [supplyPrice, setSupplyPrice] = useState("0.00");
	const [editingSupplyId, setEditingSupplyId] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [editingPrice, setEditingPrice] = useState("0.00");
	const [selectedSupplyKey, setSelectedSupplyKey] = useState("");
	const [editingOrderId, setEditingOrderId] = useState(null);
	const [pendingQuantity, setPendingQuantity] = useState("1");
	const [pendingPrice, setPendingPrice] = useState("0.00");
	const [orderDate, setOrderDate] = useState(() => {
		const today = new Date();
		const offset = today.getTimezoneOffset() * 60 * 1000;
		return new Date(today.getTime() - offset).toISOString().slice(0, 10);
	});
	const [message, setMessage] = useState("");
	const total = useMemo(() => calculateOrderTotal(items), [items]);
	const historyByYear = useMemo(() => {
		const groups = new Map();
		history.forEach((order) => {
			const date = new Date(getOrderDate(order));
			const year = Number.isNaN(date.getTime()) ? "Sin fecha" : String(date.getFullYear());
			if (!groups.has(year)) groups.set(year, []);
			groups.get(year).push(order);
		});

		return Array.from(groups.entries())
			.sort(([firstYear], [secondYear]) => {
				if (firstYear === "Sin fecha") return 1;
				if (secondYear === "Sin fecha") return -1;
				return Number(secondYear) - Number(firstYear);
			})
			.map(([year, orders]) => ({
				year,
				orders: orders.slice().sort((first, second) =>
					new Date(getOrderDate(second)).getTime() - new Date(getOrderDate(first)).getTime(),
				),
			}));
	}, [history]);

	const statistics = useMemo(() => {
		const consumption = new Map();
		let totalUnits = 0;
		let totalSpent = 0;

		history.forEach((order) => {
			totalSpent += Number(order.total) || 0;
			(order.items || []).forEach((item) => {
				const quantity = Number(item.quantity) || 0;
				if (quantity <= 0) return;
				totalUnits += quantity;
				const current = consumption.get(item.key) || { name: item.name, quantity: 0, spent: 0 };
				current.quantity += quantity;
				current.spent += calculateItemTotal(quantity, item.price);
				consumption.set(item.key, current);
			});
		});

		return {
			orderCount: history.length,
			totalSpent,
			average: history.length > 0 ? totalSpent / history.length : 0,
			totalUnits,
			consumption: Array.from(consumption.values()).sort((first, second) => second.quantity - first.quantity),
		};
	}, [history]);

	useEffect(() => {
		fetch("/api/orders")
			.then((response) => response.json())
			.then(setHistory)
			.catch(() => setMessage("No se pudo cargar el historial."));

		fetch("/api/supplies")
			.then((response) => response.json())
			.then((catalog) => {
				setSupplies(catalog);
				setItems(catalog.map((supply) => ({
					key: supply.key,
					name: supply.name,
					quantity: 0,
					price: supply.defaultPrice,
					selected: false,
				})));
			})
			.catch(() => setMessage("No se pudo cargar la configuración."));
	}, []);

	async function saveOrder() {
		const selectedItems = items.filter((item) => item.selected);
		if (selectedItems.length === 0) {
			setMessage("Añade al menos un suministro al pedido.");
			return;
		}

		const response = await fetch(editingOrderId ? `/api/orders/${editingOrderId}` : "/api/orders", {
			method: editingOrderId ? "PUT" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				items: selectedItems,
				total,
				orderDate,
			}),
		});
		if (!response.ok) {
			setMessage(editingOrderId ? "No se pudo actualizar el pedido." : "No se pudo guardar el pedido.");
			return;
		}
		const order = await response.json();
		if (editingOrderId) {
			setHistory((current) => current.map((item) => item.id === editingOrderId ? order : item));
			setMessage("Pedido actualizado correctamente.");
		} else {
			setHistory((current) => [order, ...current]);
			setMessage("Pedido guardado correctamente.");
		}
		resetOrderForm();
	}

	function resetOrderForm() {
		setEditingOrderId(null);
		setSelectedSupplyKey("");
		setPendingQuantity("1");
		setPendingPrice("0.00");
		setItems((current) => current.map((item) => ({
			...item,
			quantity: 0,
			price: supplies.find((supply) => supply.key === item.key)?.defaultPrice ?? item.price,
			selected: false,
		})));
		const today = new Date();
		const offset = today.getTimezoneOffset() * 60 * 1000;
		setOrderDate(new Date(today.getTime() - offset).toISOString().slice(0, 10));
	}

	function editOrder(order) {
		const savedItems = new Map((order.items || []).map((item) => [item.key, item]));
		setItems((current) => current.map((item) => {
			const savedItem = savedItems.get(item.key);
			return savedItem
				? { ...item, name: savedItem.name, quantity: savedItem.quantity, price: savedItem.price, selected: true }
				: { ...item, quantity: 0, selected: false };
		}));
		setEditingOrderId(order.id);
		setSelectedSupplyKey("");
		setPendingQuantity("1");
		setPendingPrice("0.00");
		setOrderDate(getOrderDate(order).slice(0, 10));
		setActiveView("order");
		setMessage("Editando pedido.");
	}

	async function deleteOrder(order) {
		const confirmed = window.confirm(
			`¿Eliminar el pedido del ${formatFullDate(getOrderDate(order))} por ${formatCurrency(order.total)}?`,
		);
		if (!confirmed) return;

		const response = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
		if (!response.ok) {
			setMessage("No se pudo eliminar el pedido.");
			return;
		}
		setHistory((current) => current.filter((item) => item.id !== order.id));
		setMessage("Pedido eliminado correctamente.");
	}

	async function createSupply(event) {
		event.preventDefault();
		const name = supplyName.trim();
		const defaultPrice = normalizePriceValue(supplyPrice);
		if (!name) {
			setMessage("Introduce un nombre para el suministro.");
			return;
		}

		const response = await fetch("/api/supplies", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, defaultPrice }),
		});
		if (!response.ok) {
			setMessage("No se pudo guardar el suministro.");
			return;
		}

		const supply = await response.json();
		setSupplies((current) => [...current, supply]);
		setItems((current) => [...current, {
			key: supply.key,
			name: supply.name,
			quantity: 0,
			price: supply.defaultPrice,
			selected: false,
		}]);
		setSupplyName("");
		setSupplyPrice("0.00");
		setMessage("Suministro creado correctamente.");
	}

	function startEditingSupply(supply) {
		setEditingSupplyId(supply.id);
		setEditingName(supply.name);
		setEditingPrice(formatPriceInput(supply.defaultPrice));
	}

	async function saveSupplyEdit(supply) {
		const name = editingName.trim();
		const defaultPrice = normalizePriceValue(editingPrice);
		if (!name) {
			setMessage("Introduce un nombre para el suministro.");
			return;
		}

		const response = await fetch(`/api/supplies/${supply.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, defaultPrice }),
		});
		if (!response.ok) {
			setMessage("No se pudo actualizar el suministro.");
			return;
		}

		setSupplies((current) => current.map((item) =>
			item.id === supply.id ? { ...item, name, defaultPrice } : item,
		));
		setItems((current) => current.map((item) =>
			item.key === supply.key ? { ...item, name, price: defaultPrice } : item,
		));
		setEditingSupplyId(null);
		setMessage("Suministro actualizado correctamente.");
	}

	async function removeSupply(supply) {
		const confirmed = window.confirm(
			`¿Eliminar el suministro “${supply.name}”?`,
		);
		if (!confirmed) return;

		const response = await fetch(`/api/supplies/${supply.id}`, { method: "DELETE" });
		if (!response.ok) {
			setMessage("No se pudo eliminar el suministro.");
			return;
		}

		setSupplies((current) => current.filter((item) => item.id !== supply.id));
		setItems((current) => current.filter((item) => item.key !== supply.key));
		setEditingSupplyId(null);
		setMessage("Suministro eliminado correctamente.");
	}

	function toggleItem(key) {
		setItems((currentItems) =>
			currentItems.map((item) =>
				item.key === key ? { ...item, selected: !item.selected } : item,
			),
		);
		if (selectedSupplyKey === key) setSelectedSupplyKey("");
	}

	function choosePendingSupply(key) {
		setSelectedSupplyKey(key);
		setPendingQuantity("1");
		const supply = items.find((item) => item.key === key);
		setPendingPrice(supply ? formatPriceInput(supply.price) : "0.00");
	}

	function addSelectedSupply() {
		if (!selectedSupplyKey) return;
		setItems((currentItems) =>
			currentItems.map((item) =>
				item.key === selectedSupplyKey
					? {
						...item,
						selected: true,
						quantity: normalizeIntegerValue(pendingQuantity),
						price: normalizePriceValue(pendingPrice),
					}
					: item,
			),
		);
		setSelectedSupplyKey("");
		setPendingQuantity("1");
		setPendingPrice("0.00");
	}

	function updateItem(key, field, value) {
		setItems((currentItems) =>
			currentItems.map((item) =>
				item.key === key ? { ...item, [field]: value } : item,
			),
		);
	}

	return (
		<>
			<nav className="navbar" aria-label="Navegación principal">
				<div className="brand">
					<img className="brand-icon" src="/favicon.svg" alt="" />
					<span>Tres cascos</span>
				</div>
				<div className="nav-actions">
					<button
						className={activeView === "order" ? "nav-button active" : "nav-button"}
						type="button"
						onClick={() => setActiveView("order")}
					>
						Pedido
					</button>
					<button
						className={activeView === "history" ? "nav-button active" : "nav-button"}
						type="button"
						onClick={() => setActiveView("history")}
					>
						Historial
					</button>
					<button
						className={activeView === "config" ? "nav-button active" : "nav-button"}
						type="button"
						onClick={() => setActiveView("config")}
					>
						Configuración
					</button>
				</div>
			</nav>
			<main className={activeView === "config" || activeView === "history" ? "app single-column-app" : "app"}>
				{activeView === "history" ? (
					<section className="card history-dashboard">
						<header className="header">
							<p className="eyebrow">Resumen</p>
							<h1>Historial y estadísticas</h1>
						</header>
						<div className="stats-grid" aria-label="Estadísticas de pedidos">
							<article className="stat-panel">
								<span>Pedidos</span>
								<strong>{statistics.orderCount}</strong>
							</article>
							<article className="stat-panel">
								<span>Gasto total</span>
								<strong>{formatCurrency(statistics.totalSpent)}</strong>
							</article>
							<article className="stat-panel">
								<span>Media por pedido</span>
								<strong>{formatCurrency(statistics.average)}</strong>
							</article>
							<article className="stat-panel">
								<span>Unidades consumidas</span>
								<strong>{statistics.totalUnits}</strong>
							</article>
						</div>
						<section className="consumption-panel">
							<h2>Consumo por suministro</h2>
							{statistics.consumption.length === 0 ? (
								<p>No hay consumo registrado.</p>
							) : (
								<ul>
									{statistics.consumption.map((item) => (
										<li key={item.name}>
											<span>{item.name}</span>
											<strong>{item.quantity} uds. · {formatCurrency(item.spent)}</strong>
										</li>
									))}
								</ul>
							)}
						</section>
						<section className="history-list-panel">
							<h2>Pedidos guardados</h2>
							{history.length === 0 ? (
								<p>No hay pedidos guardados.</p>
							) : (
								<div className="history-years">
									{historyByYear.map((group) => (
										<section className="history-year" key={group.year}>
											<header>
												<h3>{group.year}</h3>
												<span>{group.orders.length} {group.orders.length === 1 ? "pedido" : "pedidos"}</span>
											</header>
											<ul className="history-list">
												{group.orders.map((order) => {
													const orderedItems = (order.items || []).filter((item) => item.quantity > 0);
													return (
														<li key={order.id}>
															<div className="order-heading">
																<time dateTime={getOrderDate(order)} title={formatFullDate(getOrderDate(order))}>
																	{formatRelativeDate(getOrderDate(order))}
																</time>
																<strong>{formatCurrency(order.total)}</strong>
																<div className="order-actions">
																	<button className="edit-order" type="button" aria-label="Editar pedido" title="Editar pedido" onClick={() => editOrder(order)}>Editar</button>
																	<button className="delete-order" type="button" aria-label="Eliminar pedido" title="Eliminar pedido" onClick={() => deleteOrder(order)}>×</button>
																</div>
															</div>
															<ul className="order-items">
																{orderedItems.map((item) => (
																	<li key={item.key} title={`Precio unitario: ${formatCurrency(item.price)}`}>
																		<span className="order-quantity">{item.quantity}</span>
																		<span className="order-name">{item.name}</span>
																		<strong className="order-total">{formatCurrency(calculateItemTotal(item.quantity, item.price))}</strong>
																	</li>
																))}
															</ul>
														</li>
													);
												})}
											</ul>
										</section>
									))}
								</div>
							)}
						</section>
					</section>
				) : activeView === "config" ? (
					<section className="card config-card">
						<header className="header">
							<p className="eyebrow">Catálogo</p>
							<h1>Configuración de suministros</h1>
						</header>
						<form className="supply-form" onSubmit={createSupply}>
							<div className="field">
								<label htmlFor="supply-name">Tipo de suministro</label>
								<input
									id="supply-name"
									type="text"
									value={supplyName}
									onChange={(event) => setSupplyName(event.target.value)}
									placeholder="Ej. Heno"
								/>
							</div>
							<div className="field">
								<label htmlFor="supply-price">Precio por defecto</label>
								<div className="price-input">
									<input
										id="supply-price"
										type="number"
										min="0"
										step="0.10"
										inputMode="decimal"
										lang="en-US"
										value={supplyPrice}
										onChange={(event) => setSupplyPrice(event.target.value)}
										onBlur={(event) => setSupplyPrice(formatPriceInput(event.target.value))}
									/>
									<span aria-hidden="true">€</span>
								</div>
							</div>
							<button type="submit">Añadir suministro</button>
						</form>
						<h2 className="supplies-title">Suministros disponibles</h2>
						<ul className="supplies-list">
							{supplies.map((supply) => (
								<li key={supply.key}>
									{editingSupplyId === supply.id ? (
										<div className="supply-edit">
											<input
												type="text"
												value={editingName}
												onChange={(event) => setEditingName(event.target.value)}
												aria-label="Nombre del suministro"
											/>
											<div className="price-input">
												<input
													type="number"
													min="0"
													step="0.10"
													lang="en-US"
													value={editingPrice}
													onChange={(event) => setEditingPrice(event.target.value)}
													onBlur={(event) => setEditingPrice(formatPriceInput(event.target.value))}
													aria-label="Precio por defecto"
												/>
												<span aria-hidden="true">€</span>
											</div>
											<button type="button" onClick={() => saveSupplyEdit(supply)}>Guardar</button>
											<button type="button" className="secondary-button" onClick={() => setEditingSupplyId(null)}>Cancelar</button>
										</div>
									) : (
										<>
											<span>{supply.name}</span>
											<strong>{formatCurrency(supply.defaultPrice)}</strong>
											<div className="supply-actions">
												<button type="button" onClick={() => startEditingSupply(supply)}>Editar</button>
												<button type="button" className="danger-button" onClick={() => removeSupply(supply)}>Eliminar</button>
											</div>
										</>
									)}
								</li>
							))}
						</ul>
						{message && <p role="status">{message}</p>}
					</section>
				) : (
					<>
						<section className="card">
							<header className="header">
								<p className="eyebrow">Suministros para caballos</p>
								<h1>Pedido de suministros</h1>
							</header>
							<div className="supply-picker">
								<div className="field">
									<label htmlFor="supply-picker">Suministro</label>
									<select
										id="supply-picker"
										value={selectedSupplyKey}
										onChange={(event) => choosePendingSupply(event.target.value)}
									>
										<option value="">Selecciona un suministro</option>
										{items.filter((item) => !item.selected).map((item) => (
											<option key={item.key} value={item.key}>{item.name}</option>
										))}
									</select>
								</div>
								<div className="field">
									<label htmlFor="pending-quantity">Cantidad</label>
									<input
										id="pending-quantity"
										type="number"
										min="0"
										step="1"
										inputMode="numeric"
										value={pendingQuantity}
										disabled={!selectedSupplyKey}
										onChange={(event) => setPendingQuantity(event.target.value)}
									/>
								</div>
								<div className="field">
									<label htmlFor="pending-price">Precio</label>
									<div className="price-input">
										<input
											id="pending-price"
											type="number"
											min="0"
											step="0.10"
											inputMode="decimal"
											lang="en-US"
											value={pendingPrice}
											disabled={!selectedSupplyKey}
											onChange={(event) => setPendingPrice(event.target.value)}
											onBlur={(event) => setPendingPrice(formatPriceInput(event.target.value))}
										/>
										<span aria-hidden="true">€</span>
									</div>
								</div>
								<button
									className="add-supply-button"
									type="button"
									disabled={!selectedSupplyKey}
									onClick={addSelectedSupply}
								>
									Añadir
								</button>
							</div>
							<div className="items" aria-label="Lista de productos">
								{items.filter((item) => item.selected).map((item) => (
									<div className="item-row selected" data-item={item.key} key={item.key}>
										<div className="item-select">
											<button
												className="item-toggle selected"
												type="button"
												aria-label={`Quitar ${item.name}`}
												onClick={() => toggleItem(item.key)}
											>
												Quitar
											</button>
											<span className="item-name">{item.name}</span>
										</div>
										<div className="field">
											<label htmlFor={`${item.key}-cantidad`}>Cantidad</label>
											<input
												id={`${item.key}-cantidad`}
												type="number"
												min="0"
												step="1"
												inputMode="numeric"
												value={item.quantity}
												disabled={!item.selected}
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
											<div className="price-input">
												<input
													id={`${item.key}-precio`}
													type="number"
													min="0"
													step="0.10"
													inputMode="decimal"
													lang="en-US"
													value={formatPriceInput(item.price)}
													disabled={!item.selected}
													onChange={(event) =>
														updateItem(
															item.key,
															"price",
															normalizePriceValue(event.target.value),
														)
													}
													onBlur={(event) =>
														updateItem(item.key, "price", normalizePriceValue(formatPriceInput(event.target.value)))
													}
												/>
												<span aria-hidden="true">€</span>
											</div>
										</div>
										<div className="item-total">
											<span>Total</span>
											<strong>
												{formatCurrency(calculateItemTotal(item.quantity, item.price))}
											</strong>
										</div>
									</div>
								))}
							</div>
							<div className="order-date-field">
								<label htmlFor="order-date">Fecha del pedido</label>
								<input
									id="order-date"
									type="date"
									value={orderDate}
									onChange={(event) => setOrderDate(event.target.value)}
								/>
							</div>
							<div className="summary" aria-live="polite">
								<span>Total del pedido</span>
								<strong>{formatCurrency(total)}</strong>
							</div>
							<div className="order-save-actions">
								<button type="button" onClick={saveOrder}>{editingOrderId ? "Actualizar pedido" : "Guardar pedido"}</button>
								{editingOrderId && (
									<button type="button" className="secondary-button" onClick={resetOrderForm}>Cancelar edición</button>
								)}
							</div>
							{message && <p role="status">{message}</p>}
						</section>
						<section className="card recent-orders">
							<header className="header">
								<p className="eyebrow">Historial</p>
								<h2>Últimos pedidos</h2>
							</header>
							{history.length === 0 ? (
								<p>No hay pedidos guardados.</p>
							) : (
								<ul>
									{history.slice(0, 3).map((order) => {
										const orderedItems = (order.items || []).filter((item) => item.quantity > 0);
										return (
											<li key={order.id}>
												<div className="order-heading">
													<time dateTime={getOrderDate(order)} title={formatFullDate(getOrderDate(order))}>
														{formatRelativeDate(getOrderDate(order))}
													</time>
													<strong>{formatCurrency(order.total)}</strong>
													<button className="edit-order compact" type="button" aria-label="Editar pedido" title="Editar pedido" onClick={() => editOrder(order)}>Editar</button>
												</div>
												<ul className="order-items">
													{orderedItems.map((item) => (
														<li key={item.key} title={`Precio unitario: ${formatCurrency(item.price)}`}>
															<span className="order-quantity">{item.quantity}</span>
															<span className="order-name">{item.name}</span>
															<strong className="order-total">{formatCurrency(calculateItemTotal(item.quantity, item.price))}</strong>
														</li>
													))}
												</ul>
											</li>
										);
									})}
								</ul>
							)}
						</section>
					</>
				)}
			</main>
		</>
	);
}
