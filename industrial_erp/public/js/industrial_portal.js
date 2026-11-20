(function () {
	const root = document.getElementById("industrial-portal");
	if (!root) return;
	const $ = (selector) => document.querySelector(selector);
	const encode = encodeURIComponent;
	const list = (doctype) => "/app/" + doctype.toLowerCase().replaceAll(" ", "-");
	const report = (name) => "/app/query-report/" + encode(name);
	const escapeHtml = (text) => String(text || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
	const groups = {
		sales: { label: "Sales", icon: "↗", cards: [
			{ title: "Sales pipeline", description: "Manage quotations, orders, delivery and returns.", links: [["Quotations", list("Quotation")], ["Sales Orders", list("Sales Order")], ["Delivery Notes", list("Delivery Note")], ["Sales Invoices & Returns", list("Sales Invoice")], ["Customers", list("Customer")]] },
			{ title: "CRM & opportunities", description: "Keep leads, follow-ups and opportunities moving.", links: [["Leads", list("Lead")], ["Opportunities", list("Opportunity")], ["Stage tracking", report("Opportunity Stage Tracking Report")], ["Meetings & calls", report("Meeting Call Activity Summary")]] },
			{ title: "Sales performance", description: "Review invoices and customer collections.", links: [["Sales Invoices", list("Sales Invoice")], ["Payments", list("Payment Entry")]] },
		], metrics: [["Sales Orders", "Sales Order", "↗", "Customer orders"], ["Open Opportunities", "Opportunity", "◎", "Customer pipeline"], ["Open Leads", "Lead", "◉", "Active CRM records"]] },
		purchase: { label: "Purchase", icon: "⇄", cards: [
			{ title: "Procurement", description: "Manage supplier sourcing, orders and receipts.", links: [["Material Requests", list("Material Request")], ["Supplier Quotations", list("Supplier Quotation")], ["Purchase Orders", list("Purchase Order")], ["Purchase Receipts", list("Purchase Receipt")], ["Suppliers", list("Supplier")]] },
			{ title: "Purchase visibility", description: "Track open orders and supplier deliveries.", links: [["Pending receipts", report("Purchase Order Pending Receipts Report")], ["Pending receipt detail", report("Purchase Order Pending Receipt Report")], ["Purchase Invoices", list("Purchase Invoice")], ["Accounts Payable", report("Accounts Payable")]] },
		], metrics: [["Open Purchase Orders", "Purchase Order", "⇄", "Procurement workload"], ["Purchase Receipts", "Purchase Receipt", "▤", "Receipt records"], ["Suppliers", "Supplier", "◈", "Supplier network"]] },
		production: { label: "Manufacturing", icon: "⚙", cards: [
			{ title: "Production floor", description: "Plan work and follow each panel through production.", links: [["Work Orders", list("Work Order")], ["Production Plans", list("Production Plan")], ["Job Cards", list("Job Card")], ["Bill of Materials", list("BOM")]] },
			{ title: "Materials & stock", description: "Check component availability and stock movements.", links: [["Stock balance", report("Stock Balance")], ["Items", list("Item")], ["Stock Entries", list("Stock Entry")]] },
		], metrics: [["Work Orders", "Work Order", "⚙", "Production workload"], ["Production Plans", "Production Plan", "▦", "Planned production"], ["Stock Items", "Item", "◈", "Material catalog"]] },
		service: { label: "Service", icon: "⚙", cards: [
			{ title: "Asset care", description: "Review equipment, maintenance schedules and service history.", links: [["Assets", list("Asset")], ["Maintenance Schedules", list("Asset Maintenance")], ["Maintenance Logs", list("Asset Maintenance Log")], ["Purchase Orders", list("Purchase Order")]] },
		], metrics: [["Assets", "Asset", "⚙", "Tracked equipment"], ["Maintenance Schedules", "Asset Maintenance", "◷", "Preventive care"], ["Maintenance Logs", "Asset Maintenance Log", "▤", "Service history"]] },
		hr: { label: "People", icon: "◉", cards: [
			{ title: "People operations", description: "Manage employee records, attendance and payroll.", links: [["Employees", list("Employee")], ["Attendance", list("Attendance")], ["Payroll entries", list("Payroll Entry")], ["Salary Slips", list("Salary Slip")], ["Salary Components", list("Salary Component")]] },
			{ title: "Payroll insights", description: "Review payroll reporting for your team.", links: [["Salary Register", report("Salary Register")], ["Payroll Entries", list("Payroll Entry")]] },
		], metrics: [["Employees", "Employee", "◉", "People across departments"], ["Attendance", "Attendance", "◷", "Daily attendance"], ["Payroll Entries", "Payroll Entry", "▤", "Payroll runs"]] },
		management: { label: "Management", icon: "◫", cards: [
			{ title: "Business overview", description: "Review customer demand and operational activity.", links: [["Sales Orders", list("Sales Order")], ["Purchase Orders", list("Purchase Order")], ["Production Plans", list("Production Plan")], ["Assets", list("Asset")]] },
			{ title: "Operational reports", description: "Reports available to Accounts roles.", links: [["Meeting & call activity", report("Meeting Call Activity Summary")], ["Salesperson targets", report("Salesperson Monthly Target Report")]] },
		], metrics: [["Sales Orders", "Sales Order", "↗", "Customer demand"], ["Purchase Orders", "Purchase Order", "⇄", "Supply activity"], ["Employees", "Employee", "◉", "People operations"]] },
		admin: { label: "Administrator", icon: "▧", cards: [
			{ title: "All operations", description: "Access sales, procurement, production, service and people workflows.", links: [["Sales Orders", list("Sales Order")], ["Purchase Orders", list("Purchase Order")], ["Work Orders", list("Work Order")], ["Assets", list("Asset")], ["Employees", list("Employee")]] },
			{ title: "Reports", description: "Custom operational reports configured in this ERPNext site.", links: [["Opportunity stages", report("Opportunity Stage Tracking Report")], ["Pending purchase receipts", report("Purchase Order Pending Receipts Report")], ["Purchase receipt detail", report("Purchase Order Pending Receipt Report")], ["Salesperson targets", report("Salesperson Monthly Target Report")], ["Meeting & call activity", report("Meeting Call Activity Summary")]] },
			{ title: "Administration", description: "Manage configuration and user access in Frappe Desk.", links: [["Users", list("User")], ["Roles", list("Role")], ["Workspaces", "/app/workspace"]] },
		], metrics: [["Sales Orders", "Sales Order", "↗", "Customer demand"], ["Purchase Orders", "Purchase Order", "⇄", "Supply activity"], ["Employees", "Employee", "◉", "People operations"]] },
	};
	function classify(roles) {
		const set = new Set(roles);
		if (set.has("System Manager") || set.has("Administrator")) return ["admin"];
		const result = [];
		if (["Sales Manager", "Sales User", "Sales Master Manager"].some((role) => set.has(role))) result.push("sales");
		if (["Purchase Manager", "Purchase User", "Stock User"].some((role) => set.has(role))) result.push("purchase");
		if (["Manufacturing Manager", "Manufacturing User", "Manufacturing"].some((role) => set.has(role))) result.push("production");
		if (["Maintenance Manager", "Maintenance User", "Asset Manager"].some((role) => set.has(role))) result.push("service");
		if (["HR Manager", "HR User", "Payroll Manager", "Payroll User", "Employee Self Service"].some((role) => set.has(role))) result.push("hr");
		if (["Accounts Manager", "Accounts User", "System Manager"].some((role) => set.has(role))) result.push("management");
		return result.length ? result : ["sales"];
	}
	function renderNav(kinds) {
		const links = new Map([["Overview", ["◫", "/industrial-portal"]]]);
		kinds.forEach((kind) => groups[kind].cards.forEach((card) => card.links.slice(0, 2).forEach(([label, href]) => { if (!links.has(label)) links.set(label, [groups[kind].icon, href]); })));
		if (kinds.includes("admin")) links.set("Frappe Desk", ["▧", "/app"]);
		$("#portal-nav").innerHTML = [...links].map(([label, [icon, href]], index) => `<a class="nav-link${index === 0 ? " active" : ""}" href="${escapeHtml(href)}"><span class="nav-icon">${icon}</span>${escapeHtml(label)}</a>`).join("");
	}
	function renderCards(kinds) {
		const cards = kinds.flatMap((kind) => groups[kind].cards.map((card) => ({ ...card, icon: groups[kind].icon })));
		$("#workspace-grid").innerHTML = cards.map((card) => `<article class="workspace-card"><div class="card-top"><span class="card-icon">${card.icon}</span><span class="card-arrow">↗</span></div><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.description)}</p><div class="card-links">${card.links.map(([label, href]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)} <span>→</span></a>`).join("")}</div></article>`).join("");
	}
	async function getCount(doctype, filters) {
		try {
			const response = await fetch("/api/method/frappe.client.get_count?doctype=" + encode(doctype) + "&filters=" + encode(JSON.stringify(filters || {})), { credentials: "same-origin", headers: { Accept: "application/json" } });
			if (!response.ok) return "—";
			const data = await response.json();
			return new Intl.NumberFormat().format(data.message ?? 0);
		} catch (_) { return "—"; }
	}
	function renderMetrics(kinds) {
		const selected = kinds[0] === "admin" ? groups.admin.metrics : kinds.flatMap((kind) => groups[kind].metrics);
		const metrics = selected.filter((metric, index) => selected.findIndex((item) => item[0] === metric[0]) === index).slice(0, 4);
		$("#metrics-grid").innerHTML = metrics.map(([label, doctype, icon, caption], index) => `<article class="metric-card"><div class="metric-head"><span>${escapeHtml(label)}</span><span class="metric-icon">${icon}</span></div><strong id="metric-${index}">—</strong><small>${escapeHtml(caption)}</small></article>`).join("");
		metrics.forEach(async ([label, doctype], index) => {
			let filters = {};
			if (doctype === "Purchase Order" && label.startsWith("Open")) filters = { status: ["not in", ["Completed", "Closed", "Cancelled"]] };
			if (doctype === "Opportunity" && label.startsWith("Open")) filters = { status: ["not in", ["Converted", "Lost"]] };
			if (doctype === "Lead" && label.startsWith("Open")) filters = { status: ["not in", ["Converted", "Do Not Contact", "Lost"]] };
			$("#metric-" + index).textContent = await getCount(doctype, filters);
		});
	}
	async function loadProfile() {
		try {
			const who = await fetch("/api/method/frappe.auth.get_logged_user", { credentials: "same-origin" });
			const user = (await who.json()).message;
			if (!user || user === "Guest") { window.location.replace("/industrial-login"); return; }
			let roles = (window.frappe && frappe.boot && frappe.boot.user && frappe.boot.user.roles) || [];
			let fullName = user.split("@")[0].replace(/[._-]/g, " ");
			const profileResponse = await fetch("/api/method/frappe.client.get?doctype=User&name=" + encode(user), { credentials: "same-origin" });
			if (profileResponse.ok) {
				const profile = (await profileResponse.json()).message;
				if (profile) { fullName = profile.full_name || profile.first_name || fullName; if (!roles.length) roles = (profile.roles || []).map((item) => item.role); }
			}
			const kinds = classify(roles);
			const display = kinds.map((kind) => groups[kind].label).join(" · ");
			$("#user-name").textContent = fullName;
			$("#user-role").textContent = display + " workspace";
			$("#user-avatar").textContent = fullName.trim().charAt(0).toUpperCase();
			$("#welcome-title").textContent = "Good day, " + fullName.split(" ")[0];
			$("#welcome-copy").textContent = "Your " + display.toLowerCase() + " workspaces at a glance.";
			$("#welcome-eyebrow").textContent = kinds.map((kind) => groups[kind].label.toUpperCase()).join(" & ") + " OVERVIEW";
			$("#section-caption").textContent = "Shortcuts shown for your assigned roles";
			const primary = kinds[0];
			const actions = { admin: ["Open Frappe Desk", "/app"], purchase: ["Purchase Orders", list("Purchase Order")], production: ["Work Orders", list("Work Order")], service: ["View Assets", list("Asset")], hr: ["View Employees", list("Employee")], management: ["Open Frappe Desk", "/app"], sales: ["Sales Orders", list("Sales Order")] };
			const [actionLabel, actionHref] = actions[primary] || actions.sales;
			$("#primary-action").href = actionHref;
			$("#primary-action").innerHTML = `<span>${escapeHtml(actionLabel)}</span><span>→</span>`;
			renderNav(kinds); renderCards(kinds); renderMetrics(kinds);
		} catch (_) { window.location.replace("/industrial-login"); }
	}
	$("#portal-date").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
	$("#logout-button").addEventListener("click", async function () {
		this.disabled = true;
		const csrfCookie = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
		const csrf = (window.frappe && frappe.csrf_token) || window.csrf_token || document.querySelector('meta[name="csrf-token"]')?.content || (csrfCookie ? decodeURIComponent(csrfCookie[1]) : "");
		try {
			const response = await fetch("/api/method/logout", { method: "POST", credentials: "same-origin", headers: { "X-Frappe-CSRF-Token": csrf } });
			const result = await response.json();
			if (!response.ok || result.exc) throw new Error("Logout request failed");
			window.location.assign("/industrial-login");
		} catch (_) {
			this.disabled = false;
			const toast = document.getElementById("portal-toast");
			toast.textContent = "Sign out could not be completed. Please try again.";
			toast.hidden = false;
			window.setTimeout(() => { toast.hidden = true; }, 4000);
		}
	});
	$("#menu-toggle").addEventListener("click", () => $("#portal-sidebar").classList.toggle("sidebar-open"));
	loadProfile();
})();
