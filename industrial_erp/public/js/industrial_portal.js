(function () {
	const root = document.getElementById("industrial-portal");
	if (!root) return;
	const $ = (selector) => document.querySelector(selector);
	const encode = encodeURIComponent;
	const list = (doctype, preset) => "/industrial-portal?view=list&doctype=" + encode(doctype) + (preset ? "&preset=" + encode(preset) : "");
	const report = (name) => "/industrial-portal?view=report&name=" + encode(name);
	const escapeHtml = (text) => String(text || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
	const groups = {
		crm: { label: "CRM", icon: "◎", cards: [
			{ title: "Customer relationships", description: "Capture leads, follow up and move opportunities forward.", links: [["Leads", list("Lead")], ["Opportunities", list("Opportunity")], ["Meetings & calls", list("Event")], ["Opportunity stage report", report("Opportunity Stage Tracking Report")], ["Activity summary", report("Meeting Call Activity Summary")]] },
		], metrics: [["Open Leads", "Lead", "◉", "Active customer prospects"], ["Open Opportunities", "Opportunity", "◎", "Customer pipeline"], ["Meetings & Calls", "Event", "◷", "Relationship activity"]] },
		sales: { label: "Sales", icon: "↗", cards: [
			{ title: "Sales pipeline", description: "Manage quotations, orders, delivery and returns.", links: [["Quotations", list("Quotation")], ["Sales Orders", list("Sales Order")], ["Delivery Notes", list("Delivery Note")], ["Sales Invoices", list("Sales Invoice")], ["Sales Returns", list("Sales Invoice", "returns")], ["Customers", list("Customer")]] },
			{ title: "Sales performance", description: "Review delivery progress and customer collections.", links: [["Payments", list("Payment Entry")], ["Sales Order delivery report", report("Sales Order Analysis")]] },
		], metrics: [["Sales Orders", "Sales Order", "↗", "Customer orders"], ["Open Opportunities", "Opportunity", "◎", "Customer pipeline"], ["Open Leads", "Lead", "◉", "Active CRM records"]] },
		purchase: { label: "Purchase", icon: "⇄", cards: [
			{ title: "Procurement", description: "Manage supplier sourcing, orders and receipts.", links: [["Material Requests", list("Material Request")], ["Supplier Quotations", list("Supplier Quotation")], ["Purchase Orders", list("Purchase Order")], ["Purchase Receipts", list("Purchase Receipt")], ["Suppliers", list("Supplier")]] },
			{ title: "Purchase visibility", description: "Track open orders and supplier deliveries.", links: [["Pending receipts", report("Purchase Order Pending Receipts Report")], ["Supplier comparison", report("Supplier Quotation Comparison")], ["Purchase Invoices", list("Purchase Invoice")], ["Accounts Payable", report("Accounts Payable")]] },
		], metrics: [["Open Purchase Orders", "Purchase Order", "⇄", "Procurement workload"], ["Purchase Receipts", "Purchase Receipt", "▤", "Receipt records"], ["Suppliers", "Supplier", "◈", "Supplier network"]] },
		production: { label: "Manufacturing", icon: "⚙", cards: [
			{ title: "Production floor", description: "Plan work and follow each panel through production.", links: [["Work Orders", list("Work Order")], ["Production Plans", list("Production Plan")], ["Job Cards", list("Job Card")], ["Bill of Materials", list("BOM")]] },
			{ title: "Materials & stock", description: "Check component availability and stock movements.", links: [["Items", list("Item")], ["Stock Entries", list("Stock Entry")]] },
		], metrics: [["Work Orders", "Work Order", "⚙", "Production workload"], ["Production Plans", "Production Plan", "▦", "Planned production"], ["Stock Items", "Item", "◈", "Material catalog"]] },
		service: { label: "Service", icon: "⚙", cards: [
			{ title: "Asset care", description: "Review equipment, maintenance schedules and service history.", links: [["Assets", list("Asset")], ["Maintenance Schedules", list("Asset Maintenance")], ["Maintenance Logs", list("Asset Maintenance Log")], ["Purchase Orders", list("Purchase Order")]] },
		], metrics: [["Assets", "Asset", "⚙", "Tracked equipment"], ["Maintenance Schedules", "Asset Maintenance", "◷", "Preventive care"], ["Maintenance Logs", "Asset Maintenance Log", "▤", "Service history"]] },
		hr: { label: "People", icon: "◉", cards: [
			{ title: "People operations", description: "Manage employee records, attendance and payroll.", links: [["Employees", list("Employee")], ["Attendance", list("Attendance")], ["Payroll entries", list("Payroll Entry")], ["Salary Slips", list("Salary Slip")], ["Salary Components", list("Salary Component")]] },
			{ title: "Payroll insights", description: "Review payroll records for your team.", links: [["Payroll Entries", list("Payroll Entry")], ["Salary Slips", list("Salary Slip")]] },
		], metrics: [["Employees", "Employee", "◉", "People across departments"], ["Attendance", "Attendance", "◷", "Daily attendance"], ["Payroll Entries", "Payroll Entry", "▤", "Payroll runs"]] },
		management: { label: "Management", icon: "◫", cards: [
			{ title: "Business overview", description: "Review customer demand and operational activity.", links: [["Sales Orders", list("Sales Order")], ["Purchase Orders", list("Purchase Order")], ["Production Plans", list("Production Plan")], ["Assets", list("Asset")]] },
			{ title: "Operational reports", description: "Reports available to Accounts roles.", links: [["Meeting & call activity", report("Meeting Call Activity Summary")], ["Salesperson targets", report("Salesperson Monthly Target Report")]] },
		], metrics: [["Sales Orders", "Sales Order", "↗", "Customer demand"], ["Purchase Orders", "Purchase Order", "⇄", "Supply activity"], ["Employees", "Employee", "◉", "People operations"]] },
		admin: { label: "Administrator", icon: "▧", cards: [
			{ title: "All operations", description: "Access sales, procurement, production, service and people workflows.", links: [["Sales Orders", list("Sales Order")], ["Purchase Orders", list("Purchase Order")], ["Work Orders", list("Work Order")], ["Assets", list("Asset")], ["Employees", list("Employee")]] },
			{ title: "Reports", description: "Seven custom and ERPNext reports, also available from the Reports menu.", links: [["Sales Order delivery", report("Sales Order Analysis")], ["Salesperson targets", report("Salesperson Monthly Target Report")], ["Pending purchase receipts", report("Purchase Order Pending Receipts Report")], ["Supplier comparison", report("Supplier Quotation Comparison")], ["Purchase invoice due dates", report("Accounts Payable")], ["Opportunity stages", report("Opportunity Stage Tracking Report")], ["Meetings & calls", report("Meeting Call Activity Summary")]] },
			{ title: "Administration", description: "Review user access and workspace configuration.", links: [["Users", list("User")], ["Roles", list("Role")], ["Workspaces", list("Workspace")]] },
		], metrics: [["Sales Orders", "Sales Order", "↗", "Customer demand"], ["Purchase Orders", "Purchase Order", "⇄", "Supply activity"], ["Employees", "Employee", "◉", "People operations"]] },
	};
	const reportCatalog = [
		{ label: "Sales Order Delivery Tracking", name: "Sales Order Analysis", roles: ["Sales User", "Sales Manager", "Maintenance User", "Accounts User", "Stock User"], kind: "sales-order-analysis", area: "sales" },
		{ label: "Salesperson Monthly Target", name: "Salesperson Monthly Target Report", roles: ["Accounts User", "Accounts Manager", "Employee Self Service"], kind: "sales-target", area: "sales" },
		{ label: "Purchase Order Pending Receipts", name: "Purchase Order Pending Receipts Report", roles: ["Stock User", "Purchase Manager", "Purchase User"], kind: "purchase-receipts", area: "purchase" },
		{ label: "Supplier Quotation Comparison", name: "Supplier Quotation Comparison", roles: ["Manufacturing Manager", "Purchase Manager", "Purchase User", "Stock User"], kind: "supplier-comparison", area: "purchase" },
		{ label: "Purchase Invoice Due Date Tracker", name: "Accounts Payable", roles: ["Accounts User", "Purchase User", "Accounts Manager", "Auditor"], kind: "accounts-payable", area: "purchase" },
		{ label: "Opportunity Stage Tracking", name: "Opportunity Stage Tracking Report", roles: ["Sales User", "Sales Manager"], kind: "opportunity-stage", area: "crm" },
		{ label: "Meeting & Call Activity Summary", name: "Meeting Call Activity Summary", roles: [], kind: "activity-summary", area: "crm", all: true },
	];
	const schemas = {
		Quotation: { fields: [["party_name", "Customer", "link", "Customer", true], ["transaction_date", "Quotation date", "date", "", true], ["valid_till", "Valid until", "date"], ["company", "Company", "link", "Company"]], lines: true, columns: ["name", "party_name", "transaction_date", "valid_till", "status", "grand_total", "docstatus"] },
		"Sales Order": { fields: [["customer", "Customer", "link", "Customer", true], ["transaction_date", "Order date", "date", "", true], ["delivery_date", "Delivery date", "date"], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "customer", "transaction_date", "delivery_date", "status", "grand_total", "docstatus"] },
		"Sales Invoice": { fields: [["customer", "Customer", "link", "Customer", true], ["posting_date", "Invoice date", "date", "", true], ["due_date", "Due date", "date"], ["return_against", "Original invoice (returns)", "link", "Sales Invoice"], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "customer", "posting_date", "due_date", "status", "outstanding_amount", "docstatus", "is_return"] },
		Lead: { fields: [["lead_name", "Lead name", "text", "", true], ["company_name", "Company", "text"], ["email_id", "Email", "email"], ["mobile_no", "Mobile", "text"], ["source", "Source", "text"], ["status", "Status", "select", "Lead\nOpen\nReplied\nOpportunity\nQuotation\nLost"]], columns: ["name", "lead_name", "company_name", "status", "email_id", "mobile_no"] },
		Opportunity: { fields: [["opportunity_from", "Opportunity from", "select", "Lead\nCustomer", true], ["party_name", "Lead or customer", "text", "", true], ["opportunity_type", "Type", "select", "Sales\nMaintenance\nSupport"], ["expected_closing", "Expected closing", "date"], ["opportunity_amount", "Expected amount", "number"]], columns: ["name", "party_name", "status", "opportunity_type", "expected_closing", "opportunity_amount"] },
		"Purchase Order": { fields: [["supplier", "Supplier", "link", "Supplier", true], ["transaction_date", "Order date", "date", "", true], ["schedule_date", "Required by", "date"], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "supplier", "transaction_date", "schedule_date", "status", "grand_total", "docstatus"] },
		"Supplier Quotation": { fields: [["supplier", "Supplier", "link", "Supplier", true], ["transaction_date", "Quotation date", "date"], ["valid_till", "Valid until", "date"], ["company", "Company", "link", "Company"]], lines: true, columns: ["name", "supplier", "transaction_date", "valid_till", "status", "grand_total"] },
		"Purchase Receipt": { fields: [["supplier", "Supplier", "link", "Supplier", true], ["posting_date", "Receipt date", "date", "", true], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "supplier", "posting_date", "status", "grand_total", "docstatus"] },
		"Material Request": { fields: [["material_request_type", "Request type", "select", "Purchase\nMaterial Transfer\nMaterial Issue\nManufacture\nCustomer Provided", true], ["transaction_date", "Request date", "date", "", true], ["schedule_date", "Required by", "date"], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "material_request_type", "transaction_date", "schedule_date", "status"] },
		"Delivery Note": { fields: [["customer", "Customer", "link", "Customer", true], ["posting_date", "Delivery date", "date", "", true], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "customer", "posting_date", "status", "total_qty", "grand_total"] },
		"Work Order": { fields: [["production_item", "Finished item", "link", "Item", true], ["qty", "Planned quantity", "number", "", true], ["bom_no", "Bill of Materials", "link", "BOM"], ["company", "Company", "link", "Company", true], ["planned_start_date", "Planned start", "date"]], columns: ["name", "production_item", "qty", "status", "planned_start_date", "docstatus"] },
		Asset: { fields: [["asset_name", "Asset name", "text", "", true], ["item_code", "Item", "link", "Item", true], ["company", "Company", "link", "Company", true], ["location", "Location", "text"], ["purchase_date", "Purchase date", "date"], ["status", "Status", "select", "Draft\nSubmitted\nPartially Depreciated\nFully Depreciated\nSold\nScrapped"]], columns: ["name", "asset_name", "item_code", "location", "status"] },
		Employee: { fields: [["employee_name", "Employee name", "text", "", true], ["date_of_joining", "Date of joining", "date", "", true], ["department", "Department", "link", "Department"], ["designation", "Designation", "link", "Designation"], ["company", "Company", "link", "Company", true]], columns: ["name", "employee_name", "department", "designation", "status"] },
		Attendance: { fields: [["employee", "Employee", "link", "Employee", true], ["attendance_date", "Attendance date", "date", "", true], ["status", "Status", "select", "Present\nAbsent\nOn Leave", true], ["shift", "Shift", "link", "Shift"]], columns: ["name", "employee", "attendance_date", "status", "shift"] },
		"Payroll Entry": { fields: [["payroll_frequency", "Payroll frequency", "select", "Monthly\nBi-weekly\nWeekly\nFortnightly", true], ["start_date", "Period start", "date", "", true], ["end_date", "Period end", "date", "", true], ["company", "Company", "link", "Company", true]], columns: ["name", "payroll_frequency", "start_date", "end_date", "status"] },
		"Payment Entry": { fields: [["payment_type", "Payment type", "select", "Receive\nPay\nInternal Transfer", true], ["party_type", "Party type", "select", "Customer\nSupplier", true], ["party", "Customer or supplier", "text", "", true], ["posting_date", "Payment date", "date", "", true], ["paid_amount", "Paid amount", "number", "", true], ["company", "Company", "link", "Company", true]], columns: ["name", "payment_type", "party_type", "party", "posting_date", "paid_amount", "docstatus"] },
		"Asset Maintenance": { fields: [["asset_name", "Asset", "link", "Asset", true], ["maintenance_type", "Maintenance type", "select", "Preventive\nBreakdown", true], ["periodicity", "Periodicity", "select", "Daily\nWeekly\nMonthly\nQuarterly\nHalf-yearly\nYearly"], ["start_date", "Start date", "date"], ["end_date", "End date", "date"]], columns: ["name", "asset_name", "maintenance_type", "periodicity", "start_date", "end_date"] },
		"Asset Maintenance Log": { fields: [["asset_name", "Asset", "link", "Asset", true], ["maintenance_type", "Maintenance type", "select", "Preventive\nBreakdown", true], ["maintenance_date", "Maintenance date", "date", "", true], ["maintenance_status", "Status", "select", "Planned\nCompleted\nCancelled"]], columns: ["name", "asset_name", "maintenance_type", "maintenance_date", "maintenance_status"] },
		"Purchase Invoice": { fields: [["supplier", "Supplier", "link", "Supplier", true], ["posting_date", "Invoice date", "date", "", true], ["due_date", "Due date", "date"], ["company", "Company", "link", "Company", true]], lines: true, columns: ["name", "supplier", "posting_date", "due_date", "status", "outstanding_amount", "docstatus"] },
		"Job Card": { fields: [["work_order", "Work Order", "link", "Work Order", true], ["operation", "Operation", "link", "Operation", true], ["workstation", "Workstation", "link", "Workstation"], ["for_quantity", "Quantity", "number"]], columns: ["name", "work_order", "operation", "workstation", "status"] },
		"Production Plan": { fields: [["company", "Company", "link", "Company", true], ["get_items_from", "Plan based on", "select", "Sales Order\nMaterial Request", true], ["posting_date", "Plan date", "date", "", true]], columns: ["name", "company", "posting_date", "status", "docstatus"] },
		"Sales Person": { fields: [["sales_person_name", "Salesperson", "text", "", true], ["employee", "Employee", "link", "Employee"], ["parent_sales_person", "Reports to", "link", "Sales Person"]], columns: ["name", "sales_person_name", "employee", "parent_sales_person"] },
		"Notification Log": { columns: ["name", "subject", "type", "document_type", "document_name", "read", "creation"] },
		User: { columns: ["name", "full_name", "enabled", "last_login"] },
		Role: { columns: ["name", "desk_access", "disabled"] },
	};
	function classify(roles) {
		const set = new Set(roles);
		if (set.has("System Manager") || set.has("Administrator")) return ["crm", "purchase", "sales", "production", "service", "hr", "management", "admin"];
		if (set.has("Purchase User") || set.has("Purchase Manager")) {
			const purchaseRoles = ["purchase"];
			if (["Manufacturing Manager", "Manufacturing User", "Manufacturing"].some((role) => set.has(role))) purchaseRoles.push("production");
			if (["Maintenance Manager", "Maintenance User", "Asset Manager"].some((role) => set.has(role))) purchaseRoles.push("service");
			return purchaseRoles;
		}
		const result = [];
		if (["Sales Manager", "Sales User", "Sales Master Manager", "CRM Manager", "CRM User"].some((role) => set.has(role))) result.push("crm", "sales");
		if (["Purchase Manager", "Purchase User", "Stock User"].some((role) => set.has(role))) result.push("purchase");
		if (["Manufacturing Manager", "Manufacturing User", "Manufacturing"].some((role) => set.has(role))) result.push("production");
		if (["Maintenance Manager", "Maintenance User", "Asset Manager"].some((role) => set.has(role))) result.push("service");
		if (["HR Manager", "HR User", "Payroll Manager", "Payroll User", "Employee Self Service"].some((role) => set.has(role))) result.push("hr");
		if (["Accounts Manager", "Accounts User", "Auditor"].some((role) => set.has(role))) result.push("management");
		return result.length ? result : ["sales"];
	}
	function renderNav(kinds) {
		const buckets = [
			{ key: "crm", label: "CRM", icon: "◎", includes: ["crm", "hr"] },
			{ key: "purchase", label: "Purchase", icon: "⇄", includes: ["purchase", "production", "service"] },
			{ key: "sales", label: "Sales", icon: "↗", includes: ["sales", "management", "admin"] },
		];
		let overviewAdded = false;
		const navItems = buckets.map((bucket) => {
			const visibleGroups = bucket.includes.filter((key) => kinds.includes(key));
			if (!visibleGroups.length) return "";
			const links = new Map();
			visibleGroups.forEach((key) => groups[key].cards.forEach((card) => {
				if (visibleGroups.length > 1 && key !== bucket.key) links.set("__section__" + key, [groups[key].label, ""]);
				card.links.forEach(([label, href]) => { if (!links.has(label)) links.set(label, [groups[key].icon, href]); });
			}));
			if (bucket.key === "crm") links.set("Notifications", ["◉", "/industrial-portal?view=notifications"]);
			const children = [...links].map(([label, [icon, href]]) => label.startsWith("__section__") ? `<span class="nav-subheading">${escapeHtml(icon)}</span>` : `<a class="nav-link nav-child" href="${escapeHtml(href)}"><span class="nav-icon">${icon}</span>${escapeHtml(label)}</a>`).join("");
			const overview = overviewAdded ? "" : '<a class="nav-link nav-child overview-child" href="/industrial-portal"><span class="nav-icon">◫</span>Overview</a>';
			overviewAdded = true;
			return `<details class="nav-group" open><summary><span class="nav-group-icon">${bucket.icon}</span>${bucket.label}<span class="nav-chevron">⌄</span></summary><div class="nav-children">${overview}${children}</div></details>`;
		});
		if (kinds.includes("admin")) navItems.push('<a class="nav-link desk-link" href="/app"><span class="nav-icon">▧</span>Frappe Desk</a>');
		$("#portal-nav").innerHTML = navItems.join("");
	}
	function renderReports(roles) {
		const roleSet = new Set(roles);
		const isAdmin = roleSet.has("System Manager") || roleSet.has("Administrator");
		const purchaseOnly = (roleSet.has("Purchase User") || roleSet.has("Purchase Manager")) && !isAdmin;
		const visible = reportCatalog.filter((item) => (isAdmin || item.all || item.roles.some((role) => roleSet.has(role))) && !(purchaseOnly && item.area !== "purchase"));
		const menu = $("#reports-menu");
		menu.innerHTML = visible.length ? visible.map((item) => `<a class="report-menu-item" href="${report(item.name)}"><span class="report-menu-icon">▤</span><span>${escapeHtml(item.label)}<small>${item.roles.length ? "Role access" : "All users"}</small></span><span class="report-menu-arrow">↗</span></a>`).join("") : '<div class="reports-empty">No reports are assigned to your roles.</div>';
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
	async function renderCharts(kinds) {
		const chartGroups = {
			crm: { label: "CRM", docs: [["Leads", "Lead"], ["Opportunities", "Opportunity"], ["Activities", "Event"]] },
			sales: { label: "Sales", docs: [["Quotations", "Quotation"], ["Sales Orders", "Sales Order"], ["Invoices", "Sales Invoice"]] },
			purchase: { label: "Purchase", docs: [["Purchase Orders", "Purchase Order"], ["Receipts", "Purchase Receipt"], ["Purchase Invoices", "Purchase Invoice"]] },
			production: { label: "Production", docs: [["Work Orders", "Work Order"], ["Production Plans", "Production Plan"]] },
			service: { label: "Maintenance", docs: [["Assets", "Asset"], ["Maintenance Logs", "Asset Maintenance Log"]] },
			hr: { label: "People", docs: [["Employees", "Employee"], ["Attendance", "Attendance"], ["Payroll Entries", "Payroll Entry"]] },
			management: { label: "Management", docs: [["Sales Orders", "Sales Order"], ["Purchase Orders", "Purchase Order"], ["Employees", "Employee"]] },
		};
		let selected = kinds.includes("admin") ? ["crm", "sales", "purchase", "production", "service", "hr"] : kinds;
		selected = [...new Set(selected)].filter((kind) => chartGroups[kind]);
		const entries = selected.map((kind) => ({ label: chartGroups[kind].label, doctype: chartGroups[kind].docs.map((item) => item[1]) }));
		if (!entries.length) { $("#workflow-bars").innerHTML = '<p class="charts-empty">No chart data is available for this role.</p>'; return; }
		const values = await Promise.all(entries.map(async (entry) => {
			const counts = await Promise.all(entry.doctype.map((doctype) => getCount(doctype, {})));
			const valid = counts.map((count) => count === "—" ? null : Number(String(count).replaceAll(",", ""))).filter((count) => count !== null && Number.isFinite(count));
			return { label: entry.label, count: valid.length ? valid.reduce((sum, count) => sum + count, 0) : null };
		}));
		const max = Math.max(1, ...values.map((item) => item.count || 0));
		const colors = ["#367fa7", "#e19752", "#697fab", "#50a0ad", "#b1748f", "#71859a"];
		$("#workflow-bars").innerHTML = values.map((item, index) => `<div class="workflow-bar-row"><span class="workflow-bar-label">${escapeHtml(item.label)}</span><span class="workflow-bar-track"><span class="workflow-bar-fill" style="display:block;width:${item.count === null ? 0 : Math.max(item.count ? 3 : 0, item.count / max * 100)}%;background:${colors[index % colors.length]}"></span></span><strong class="workflow-bar-value">${item.count === null ? "—" : new Intl.NumberFormat().format(item.count)}</strong></div>`).join("");
		const available = values.filter((item) => item.count !== null);
		const total = available.reduce((sum, item) => sum + item.count, 0);
		$("#chart-total").textContent = available.length ? new Intl.NumberFormat().format(total) : "—";
		const circumference = 2 * Math.PI * 40;
		let offset = 0;
		$("#donut-segments").innerHTML = available.map((item) => {
			const index = values.indexOf(item);
			const length = total ? item.count / total * circumference : 0;
			const segment = `<circle class="donut-segment" cx="60" cy="60" r="40" stroke="${colors[index % colors.length]}" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}"></circle>`;
			offset += length;
			return segment;
		}).join("");
		$("#chart-legend").innerHTML = values.map((item) => { const index = values.indexOf(item); const share = total && item.count !== null ? Math.round(item.count / total * 100) : 0; return `<div class="legend-item"><span class="legend-swatch" style="background:${colors[index % colors.length]}"></span><span>${escapeHtml(item.label)}</span><strong class="legend-value">${item.count === null ? "—" : share + "%"}</strong></div>`; }).join("");
	}
	function pageHeader(title, subtitle, action) {
		return `<div class="custom-page-head"><div><p class="eyebrow">OPERATIONS WORKSPACE</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle || "Manage work with the same Frappe permissions and validations.")}</p></div>${action || ""}</div>`;
	}
	function renderCustomNav() {
		const dashboard = $("#dashboard-view");
		const page = $("#page-view");
		const params = new URLSearchParams(window.location.search);
		const view = params.get("view");
		if (!view) { dashboard.hidden = false; page.hidden = true; return; }
		dashboard.hidden = true;
		page.hidden = false;
		$("#page-crumb").textContent = view === "notifications" ? "Notifications" : (params.get("doctype") || params.get("name") || view).replaceAll("_", " ");
		page.innerHTML = `<div class="custom-page-loading">Loading workspace…</div>`;
		if (view === "list") renderList(params.get("doctype"), params.get("preset"));
		else if (view === "new") renderForm(params.get("doctype"));
		else if (view === "record") renderRecord(params.get("doctype"), params.get("name"));
		else if (view === "notifications") renderNotifications();
		else if (view === "report") renderReport(params.get("name"));
		else page.innerHTML = `${pageHeader("Page not found", "Choose a workspace page from the menu.")}<a class="button button-secondary" href="/industrial-portal">Return to overview</a>`;
	}
	function formatValue(value) {
		if (value === null || value === undefined || value === "") return "—";
		if (typeof value === "object") return escapeHtml(JSON.stringify(value));
		return escapeHtml(value);
	}
	async function resource(doctype, suffix, options) {
		const response = await fetch("/api/resource/" + encode(doctype) + (suffix ? "/" + encode(suffix) : "") + (options || ""), { credentials: "same-origin", headers: { Accept: "application/json" } });
		const result = await response.json();
		if (!response.ok || result.exc) throw new Error(result.message || "You may not have permission to view this information.");
		return result.data;
	}
	async function renderList(doctype, preset) {
		const page = $("#page-view");
		const schema = schemas[doctype] || { columns: ["name", "modified"] };
		if (!doctype) { page.innerHTML = `${pageHeader("Choose a workspace", "Select an area from your role menu.")}`; return; }
		const canCreate = Boolean(schema.fields);
		const actionLabel = preset === "returns" ? "New Sales Return" : "New " + doctype;
		const action = canCreate ? `<a class="button button-primary" href="${escapeHtml("/industrial-portal?view=new&doctype=" + encode(doctype) + (preset ? "&preset=" + encode(preset) : ""))}">${escapeHtml(actionLabel)} <span>＋</span></a>` : "";
		const pageTitle = preset === "returns" ? "Sales Returns" : doctype + "s";
		page.innerHTML = `${pageHeader(pageTitle, "Browse and manage " + doctype + " records.", action)}<div class="list-toolbar"><input id="record-search" class="portal-input search-input" type="search" placeholder="Search loaded records"><span id="record-count" class="record-count"></span></div><div id="list-message"></div><div class="data-table-wrap"><table class="data-table"><thead><tr>${schema.columns.map((field) => `<th>${escapeHtml(field.replaceAll("_", " "))}</th>`).join("")}<th></th></tr></thead><tbody id="record-rows"><tr><td colspan="${schema.columns.length + 1}">Loading records…</td></tr></tbody></table></div><button class="button button-secondary load-more-button" id="load-more" type="button" hidden>Load more records</button><a class="back-link" href="/industrial-portal">← Back to overview</a>`;
		try {
			const fields = [...new Set([...schema.columns, "name"])];
			let filters = "";
			if (preset === "returns") filters = "&filters=" + encode(JSON.stringify([["is_return", "=", 1]]));
			if (doctype === "Notification Log") {
				const me = (await (await fetch("/api/method/frappe.auth.get_logged_user", { credentials: "same-origin" })).json()).message;
				filters = "&filters=" + encode(JSON.stringify([["for_user", "=", me]]));
			}
			const tbody = $("#record-rows");
			const button = $("#load-more");
			let start = 0;
			async function loadRows() {
				button.disabled = true; button.textContent = "Loading…";
				const query = "?fields=" + encode(JSON.stringify(fields)) + "&limit_page_length=50&limit_start=" + start + "&order_by=modified desc" + filters;
				const rows = await resource(doctype, "", query);
				start += rows.length;
				$("#record-count").textContent = start + " records loaded";
				if (!start && !rows.length) tbody.innerHTML = `<tr><td colspan="${schema.columns.length + 1}" class="empty-row">No ${escapeHtml(doctype.toLowerCase())} records found.</td></tr>`;
				else tbody.insertAdjacentHTML("beforeend", rows.map((row) => `<tr data-search="${escapeHtml(Object.values(row).join(" ").toLowerCase())}">${schema.columns.map((field) => `<td>${formatValue(row[field])}</td>`).join("")}<td><a class="row-link" href="/industrial-portal?view=record&doctype=${encode(doctype)}&name=${encode(row.name)}">Open →</a></td></tr>`).join(""));
				button.hidden = rows.length < 50; button.disabled = false; button.textContent = "Load more records";
			}
			button.addEventListener("click", () => loadRows().catch((error) => { $("#list-message").innerHTML = `<div class="inline-error">${escapeHtml(error.message)}</div>`; button.disabled = false; button.textContent = "Retry"; }));
			$("#record-search").addEventListener("input", (event) => { const term = event.target.value.toLowerCase(); [...tbody.querySelectorAll("tr[data-search]")].forEach((row) => { row.hidden = !row.dataset.search.includes(term); }); });
			await loadRows();
		} catch (error) { $("#list-message").innerHTML = `<div class="inline-error">${escapeHtml(error.message)}</div>`; $("#record-rows").innerHTML = ""; }
	}
	function fieldControl(field, index) {
		const [name, label, type, options, required] = field;
		const id = "field-" + index;
		if (type === "select") return `<label>${escapeHtml(label)}${required ? " *" : ""}<select class="portal-input" id="${id}" name="${escapeHtml(name)}" ${required ? "required" : ""}><option value="">Choose…</option>${(options || "").split("\n").map((option) => `<option>${escapeHtml(option.trim())}</option>`).join("")}</select></label>`;
		const inputType = ["date", "number", "email"].includes(type) ? type : "text";
		const datalist = type === "link" ? `<datalist id="suggest-${id}"></datalist>` : "";
		return `<label>${escapeHtml(label)}${required ? " *" : ""}<input class="portal-input" id="${id}" name="${escapeHtml(name)}" type="${inputType}" ${required ? "required" : ""} ${type === "link" ? `autocomplete="off" data-link="${escapeHtml(options)}" list="suggest-${id}"` : ""}>${datalist}</label>`;
	}
	function lineItemsHtml() {
		return `<div class="line-items-box"><div class="line-items-title"><strong>Items</strong><button class="text-button" id="add-line" type="button">＋ Add item</button></div><div id="line-items"><div class="line-item-row"><label>Item code<input class="portal-input item-code" required autocomplete="off"></label><label>Qty<input class="portal-input item-qty" type="number" min="0.001" step="any" value="1" required></label><label>Rate<input class="portal-input item-rate" type="number" min="0" step="any" value="0"></label><button class="remove-line" type="button" aria-label="Remove item">×</button></div></div><p class="field-hint">Frappe calculates taxes and totals from your company settings.</p></div>`;
	}
	async function renderForm(doctype) {
		const page = $("#page-view");
		const schema = schemas[doctype];
		const returnPreset = new URLSearchParams(window.location.search).get("preset") === "returns" && doctype === "Sales Invoice";
		if (!schema || !schema.fields) { page.innerHTML = `${pageHeader("Create " + (doctype || "record"), "This page is view only for this record type.")}<a class="button button-secondary" href="/industrial-portal">Return to overview</a>`; return; }
		page.innerHTML = `${pageHeader(returnPreset ? "New Sales Return" : "New " + doctype, "Enter the record details. Frappe validates and saves this document.")}<form id="document-form" class="document-form"><div class="form-grid">${schema.fields.map((field, index) => fieldControl(returnPreset && field[0] === "return_against" ? [...field.slice(0, 4), true] : field, index)).join("")}</div>${schema.lines ? lineItemsHtml() : ""}<div id="form-error" class="inline-error" hidden></div><div class="form-actions"><a class="button button-secondary" href="${list(doctype, returnPreset ? "returns" : "")}">Cancel</a><button class="button button-primary" type="submit">Save draft <span>→</span></button></div></form>`;
		const form = $("#document-form");
		form.querySelectorAll("[data-link]").forEach((input) => input.addEventListener("input", () => lookupLink(input)));
		if (schema.lines) {
			$("#add-line").addEventListener("click", () => { const row = document.createElement("div"); row.className = "line-item-row"; row.innerHTML = '<label>Item code<input class="portal-input item-code" required autocomplete="off"></label><label>Qty<input class="portal-input item-qty" type="number" min="0.001" step="any" value="1" required></label><label>Rate<input class="portal-input item-rate" type="number" min="0" step="any" value="0"></label><button class="remove-line" type="button" aria-label="Remove item">×</button>'; $("#line-items").appendChild(row); });
			$("#line-items").addEventListener("click", (event) => { if (event.target.classList.contains("remove-line") && document.querySelectorAll(".line-item-row").length > 1) event.target.closest(".line-item-row").remove(); });
		}
		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			const button = form.querySelector('[type="submit"]'); button.disabled = true; button.textContent = "Saving…";
			const doc = { doctype };
			new FormData(form).forEach((value, key) => { if (value !== "") doc[key] = value; });
			if (doctype === "Quotation") { doc.quotation_to = "Customer"; }
			if (returnPreset) doc.is_return = 1;
			if (schema.lines) doc.items = [...document.querySelectorAll(".line-item-row")].map((row) => ({ item_code: row.querySelector(".item-code").value.trim(), qty: returnPreset ? -Math.abs(Number(row.querySelector(".item-qty").value)) : Number(row.querySelector(".item-qty").value), rate: Number(row.querySelector(".item-rate").value || 0) }));
			try {
				const response = await fetch("/api/resource/" + encode(doctype), { method: "POST", credentials: "same-origin", headers: apiHeaders(), body: JSON.stringify(doc) });
				const result = await response.json();
				if (!response.ok || result.exc) throw new Error(result.message || "Frappe could not save this document.");
				window.location.assign("/industrial-portal?view=record&doctype=" + encode(doctype) + "&name=" + encode(result.data.name));
			} catch (error) { const errorBox = $("#form-error"); errorBox.textContent = error.message; errorBox.hidden = false; button.disabled = false; button.innerHTML = "Save draft <span>→</span>"; }
		});
	}
	function apiHeaders() {
		const csrfCookie = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
		const csrf = (window.frappe && frappe.csrf_token) || window.csrf_token || (csrfCookie ? decodeURIComponent(csrfCookie[1]) : "");
		return { Accept: "application/json", "Content-Type": "application/json", "X-Frappe-CSRF-Token": csrf };
	}
	function callFrappe(method, args) {
		return new Promise((resolve, reject) => {
			if (window.frappe && typeof frappe.call === "function") {
				frappe.call({ method, args, callback: (response) => resolve(response.message), error: reject });
				return;
			}
			fetch("/api/method/" + method, { method: "POST", credentials: "same-origin", headers: apiHeaders(), body: JSON.stringify(args || {}) })
				.then(async (response) => { const result = await response.json(); if (!response.ok || result.exc) throw new Error(result.message || "Frappe request failed."); resolve(result.message); })
				.catch(reject);
		});
	}
	let lookupTimer;
	async function lookupLink(input) {
		window.clearTimeout(lookupTimer);
		const term = input.value.trim();
		if (term.length < 2) return;
		lookupTimer = window.setTimeout(async () => {
			try {
				const dt = input.dataset.link;
				const fields = ["name"];
				const filters = [["name", "like", "%" + term + "%"]];
				const rows = await resource(dt, "", "?fields=" + encode(JSON.stringify(fields)) + "&filters=" + encode(JSON.stringify(filters)) + "&limit_page_length=8");
				const list = document.getElementById(input.getAttribute("list"));
				if (list) list.innerHTML = rows.map((row) => `<option value="${escapeHtml(row.name)}"></option>`).join("");
			} catch (_) { /* The entered link value is still submitted to Frappe validation. */ }
		}, 220);
	}
	async function renderRecord(doctype, name) {
		const page = $("#page-view");
		if (!doctype || !name) { page.innerHTML = pageHeader("Record unavailable", "The record link is incomplete."); return; }
		page.innerHTML = `${pageHeader(name, doctype)}<div class="custom-page-loading">Loading record…</div>`;
		try {
			const doc = await resource(doctype, name);
			const schema = schemas[doctype] || {};
			const fields = (schema.columns || Object.keys(doc).filter((key) => !["doctype", "__onload", "__last_sync_on"].includes(key)).slice(0, 18)).filter((field) => !["name", "items", "modified"].includes(field));
			const action = doc.docstatus === 0 && schema.fields ? `<button class="button button-primary" id="submit-document">Submit document <span>→</span></button>` : "";
			page.innerHTML = `${pageHeader(name, doctype, action)}<div class="record-panel"><div class="record-state"><span class="eyebrow">DOCUMENT STATUS</span><strong>${doc.docstatus === 1 ? "Submitted" : doc.docstatus === 2 ? "Cancelled" : escapeHtml(doc.status || "Draft")}</strong></div><div class="record-fields">${fields.map((field) => `<div class="record-field"><small>${escapeHtml(field.replaceAll("_", " "))}</small><strong>${formatValue(doc[field])}</strong></div>`).join("")}</div>${Array.isArray(doc.items) ? `<h3>Items</h3><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${doc.items.map((item) => `<tr><td>${formatValue(item.item_code)}</td><td>${formatValue(item.qty)}</td><td>${formatValue(item.rate)}</td><td>${formatValue(item.amount)}</td></tr>`).join("")}</tbody></table></div>` : ""}</div><a class="back-link" href="${list(doctype)}">← Back to ${escapeHtml(doctype)}s</a>`;
			const submit = $("#submit-document");
			if (submit) submit.addEventListener("click", () => submitDocument(doc));
		} catch (error) { page.innerHTML = `${pageHeader("Record unavailable", error.message)}<a class="button button-secondary" href="${list(doctype)}">Back to ${escapeHtml(doctype)}s</a>`; }
	}
	function submitDocument(doc) {
		const button = $("#submit-document"); button.disabled = true; button.textContent = "Submitting…";
		if (window.frappe && typeof frappe.call === "function") {
			frappe.call({ method: "frappe.client.submit", args: { doc }, callback: () => window.location.reload(), error: (error) => { button.disabled = false; button.textContent = "Submit document →"; alert(error.message || "Unable to submit this document."); } });
			return;
		}
		fetch("/api/method/frappe.client.submit", { method: "POST", credentials: "same-origin", headers: apiHeaders(), body: JSON.stringify({ doc }) }).then(async (response) => { const result = await response.json(); if (!response.ok || result.exc) throw new Error(result.message || "Unable to submit this document."); window.location.reload(); }).catch((error) => { button.disabled = false; button.textContent = "Submit document →"; alert(error.message); });
	}
	async function renderNotifications() {
		const page = $("#page-view");
		page.innerHTML = `${pageHeader("Notifications", "Updates and document activity assigned to your account.")}<div id="notification-list" class="notification-list"><div class="custom-page-loading">Loading notifications…</div></div>`;
		try {
			const user = (await (await fetch("/api/method/frappe.auth.get_logged_user", { credentials: "same-origin" })).json()).message;
			const fields = ["name", "subject", "email_content", "type", "document_type", "document_name", "read", "creation"];
			const filters = [["for_user", "=", user]];
			const rows = await resource("Notification Log", "", "?fields=" + encode(JSON.stringify(fields)) + "&filters=" + encode(JSON.stringify(filters)) + "&limit_page_length=50&order_by=creation desc");
			$("#notification-list").innerHTML = rows.length ? rows.map((notice) => `<article class="notification-card${notice.read ? "" : " unread"}" data-notice="${escapeHtml(notice.name)}"><span class="notification-dot"></span><div class="notice-body"><strong>${formatValue(notice.subject || notice.type || "Update")}</strong><p>${formatValue(notice.email_content || "")}</p><small>${formatValue(notice.document_type)} ${notice.document_name ? `· <a class="row-link" href="/industrial-portal?view=record&doctype=${encode(notice.document_type)}&name=${encode(notice.document_name)}">${formatValue(notice.document_name)}</a>` : ""} · ${formatValue(notice.creation)}</small></div>${notice.read ? "" : '<button class="text-button mark-notice-read" type="button">Mark read</button>'}</article>`).join("") : `<div class="empty-state"><span>◉</span><h3>You're all caught up</h3><p>New updates will appear here.</p></div>`;
			$("#notification-list").addEventListener("click", async (event) => {
				const button = event.target.closest(".mark-notice-read");
				if (!button) return;
				const card = button.closest("[data-notice]");
				button.disabled = true;
				try {
					await callFrappe("frappe.desk.doctype.notification_log.notification_log.mark_as_read", { docname: card.dataset.notice });
					card.classList.remove("unread"); button.remove();
				} catch (_) { button.disabled = false; }
			});
		} catch (error) { $("#notification-list").innerHTML = `<div class="inline-error">${escapeHtml(error.message)}<br>Your Frappe user must have access to its own notification records.</div>`; }
	}
	async function renderReport(name) {
		const page = $("#page-view");
		if (!name) { page.innerHTML = pageHeader("Report", "Choose a report from your workspace."); return; }
		const isReceiptReport = name.includes("Purchase Order Pending");
		const isTargetReport = name === "Salesperson Monthly Target Report";
		const isActivityReport = name === "Meeting Call Activity Summary";
		const isOpportunityReport = name === "Opportunity Stage Tracking Report";
		const isSalesOrderAnalysis = name === "Sales Order Analysis";
		const isSupplierComparison = name === "Supplier Quotation Comparison";
		const isAccountsPayable = name === "Accounts Payable";
		const defaultFrom = new Date(); defaultFrom.setDate(1);
		const dateString = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
		let defaultCompany = "";
		try { defaultCompany = frappe.defaults.get_user_default("Company") || frappe.boot.sysdefaults.company || ""; } catch (_) { /* User can select their company below. */ }
		let filtersHtml = "";
		if (isReceiptReport) filtersHtml = `<label>From date<input class="portal-input" type="date" name="from_date" value="${dateString(defaultFrom)}" required></label><label>To date<input class="portal-input" type="date" name="to_date" value="${dateString(new Date())}" required></label><label>Supplier<input class="portal-input" name="supplier" placeholder="Any supplier" data-link="Supplier" list="report-supplier-options"><datalist id="report-supplier-options"></datalist></label><label>Purchase Order<input class="portal-input" name="purchase_order" placeholder="Any order" data-link="Purchase Order" list="report-po-options"><datalist id="report-po-options"></datalist></label><label>Receipt status<select class="portal-input" name="receipt_status"><option>All</option><option>Pending</option><option>Partially Received</option><option>Overdue</option></select></label>`;
		if (isTargetReport) filtersHtml = `<label>Year<input class="portal-input" type="number" name="year" min="2000" max="2100" value="${new Date().getFullYear()}" required></label><label>Month<select class="portal-input" name="month"><option value="">All months</option>${"January February March April May June July August September October November December".split(" ").map((month) => `<option>${month}</option>`).join("")}</select></label><label>Salesperson<input class="portal-input" name="sales_person" placeholder="Any salesperson"></label><label>Status<select class="portal-input" name="status"><option value="">All statuses</option><option>Achieved</option><option>Not Achieved</option></select></label>`;
		if (isActivityReport) filtersHtml = `<label>From date<input class="portal-input" type="date" name="from_date"></label><label>To date<input class="portal-input" type="date" name="to_date"></label><label>Activity<select class="portal-input" name="activity_category"><option value="">Meetings and calls</option><option>Meeting</option><option>Call</option></select></label><label>Status<input class="portal-input" name="status" placeholder="Any status"></label><label>Linked type<select class="portal-input" name="reference_doctype"><option value="">Any record type</option><option>Lead</option><option>Opportunity</option></select></label>`;
		if (isOpportunityReport) filtersHtml = `<label>Opportunity owner<input class="portal-input" name="opportunity_owner" placeholder="Any owner"></label><label>Sales stage<input class="portal-input" name="sales_stage" placeholder="Any stage"></label><label>Created from<input class="portal-input" type="date" name="from_date"></label><label>Created to<input class="portal-input" type="date" name="to_date"></label><label>Status<input class="portal-input" name="status" placeholder="Any status"></label>`;
		if (isSalesOrderAnalysis) filtersHtml = `<label>Company<input class="portal-input" name="company" value="${escapeHtml(defaultCompany)}" data-link="Company" list="report-company-options" required><datalist id="report-company-options"></datalist></label><label>From date<input class="portal-input" type="date" name="from_date" value="${dateString(defaultFrom)}" required></label><label>To date<input class="portal-input" type="date" name="to_date" value="${dateString(new Date())}" required></label><label>Warehouse<input class="portal-input" name="warehouse" data-link="Warehouse" list="report-warehouse-options"><datalist id="report-warehouse-options"></datalist></label>`;
		if (isSupplierComparison) filtersHtml = `<label>Company<input class="portal-input" name="company" value="${escapeHtml(defaultCompany)}" data-link="Company" list="report-company-options" required><datalist id="report-company-options"></datalist></label><label>From date<input class="portal-input" type="date" name="from_date" value="${dateString(defaultFrom)}" required></label><label>To date<input class="portal-input" type="date" name="to_date" value="${dateString(new Date())}" required></label><label>Item<input class="portal-input" name="item_code" data-link="Item" list="report-item-options"><datalist id="report-item-options"></datalist></label><label>Group by<select class="portal-input" name="categorize_by"><option value="Categorize by Supplier">Supplier</option><option value="Categorize by Item">Item</option></select></label><label>Status<select class="portal-input" name="status"><option value="Submitted">Submitted</option><option value="Draft">Draft</option><option value="">All</option></select></label>`;
		if (isAccountsPayable) filtersHtml = `<label>Company<input class="portal-input" name="company" value="${escapeHtml(defaultCompany)}" data-link="Company" list="report-company-options" required><datalist id="report-company-options"></datalist></label><label>Report date<input class="portal-input" type="date" name="report_date" value="${dateString(new Date())}" required></label><label>Ageing based on<select class="portal-input" name="ageing_based_on"><option>Due Date</option><option>Posting Date</option><option>Supplier Invoice Date</option></select></label><label>Party<input class="portal-input" name="party" data-link="Supplier" list="report-supplier-options"><datalist id="report-supplier-options"></datalist></label>`;
		page.innerHTML = `${pageHeader(name, "Run this report using your Frappe role permissions.")}<form id="report-form" class="report-filters">${filtersHtml}<button class="button button-primary" type="submit">Run report <span>→</span></button></form><div id="report-result"></div>`;
		page.querySelectorAll("[data-link]").forEach((input) => input.addEventListener("input", () => lookupLink(input)));
		$("#report-form").addEventListener("submit", async (event) => {
			event.preventDefault();
			const result = $("#report-result"); result.innerHTML = `<div class="custom-page-loading">Running report…</div>`;
			const filters = Object.fromEntries(new FormData(event.currentTarget).entries());
			try {
				const payload = await callFrappe("frappe.desk.query_report.run", { report_name: name, filters });
				const columns = payload.columns || [];
				const rows = payload.result || payload.data || [];
				if (!columns.length) { result.innerHTML = `<div class="empty-state"><h3>Report completed</h3><p>${rows.length} rows returned.</p></div>`; return; }
				const labels = columns.map((column) => typeof column === "string" ? column.split(":")[0] : column.label || column.fieldname || "Value");
				result.innerHTML = `<div class="data-table-wrap report-table"><table class="data-table"><thead><tr>${labels.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((column, index) => { const key = typeof column === "string" ? column.split(":")[0] : column.fieldname; const value = Array.isArray(row) ? row[index] : row[key]; return `<td>${formatValue(value)}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
			} catch (error) { result.innerHTML = `<div class="inline-error">${escapeHtml(error.message)}</div>`; }
		});
		if (!isTargetReport) $("#report-form").requestSubmit();
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
			const actions = { admin: ["Manage users", list("User")], purchase: ["Purchase Orders", list("Purchase Order")], production: ["Work Orders", list("Work Order")], service: ["View Assets", list("Asset")], hr: ["View Employees", list("Employee")], management: ["Business overview", "/industrial-portal"], sales: ["Sales Orders", list("Sales Order")] };
			const [actionLabel, actionHref] = actions[primary] || actions.sales;
			$("#primary-action").href = actionHref;
			$("#primary-action").innerHTML = `<span>${escapeHtml(actionLabel)}</span><span>→</span>`;
			renderReports(roles);
			renderNav(kinds); renderCards(kinds); renderMetrics(kinds); renderCustomNav();
			if (!new URLSearchParams(window.location.search).get("view")) renderCharts(kinds);
		} catch (_) { window.location.replace("/industrial-login"); }
	}
	$("#portal-date").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
	$("#reports-toggle").addEventListener("click", (event) => {
		event.stopPropagation();
		const menu = $("#reports-menu");
		menu.hidden = !menu.hidden;
		$("#reports-toggle").setAttribute("aria-expanded", String(!menu.hidden));
	});
	document.addEventListener("click", (event) => {
		if (!event.target.closest(".reports-control")) { $("#reports-menu").hidden = true; $("#reports-toggle").setAttribute("aria-expanded", "false"); }
	});
	$("#logout-button").addEventListener("click", async function () {
		this.disabled = true;
		const signOut = () => window.location.assign("/industrial-login");
		if (window.frappe && typeof frappe.call === "function") {
			frappe.call({ method: "logout", callback: signOut, error: () => showLogoutError(this) });
			return;
		}
		const csrfCookie = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
		const csrf = window.csrf_token || document.querySelector('meta[name="csrf-token"]')?.content || (csrfCookie ? decodeURIComponent(csrfCookie[1]) : "");
		try {
			const response = await fetch("/api/method/logout", { method: "POST", credentials: "same-origin", headers: { "X-Frappe-CSRF-Token": csrf } });
			const result = await response.json();
			if (!response.ok || result.exc) throw new Error("Logout request failed");
			signOut();
		} catch (_) {
			showLogoutError(this);
		}
	});
	$("#menu-toggle").addEventListener("click", () => $("#portal-sidebar").classList.toggle("sidebar-open"));
	loadProfile();

	function showLogoutError(button) {
		button.disabled = false;
		const toast = document.getElementById("portal-toast");
		toast.textContent = "Sign out could not be completed. Please try again.";
		toast.hidden = false;
		window.setTimeout(() => { toast.hidden = true; }, 4000);
	}
})();
