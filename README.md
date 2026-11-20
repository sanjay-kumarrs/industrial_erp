# Industrial ERP

An industrial operations app for Frappe and ERPNext, with a responsive custom workspace organized under CRM, Purchase and Sales.

## Frontend architecture

- `industrial_erp/templates/pages/industrial_login.html` serves the branded sign-in page at `/industrial-login`.
- `industrial_erp/templates/pages/industrial_portal.html` serves the custom portal at `/industrial-portal`.
- `industrial_erp/public/css/industrial_portal.css` contains the responsive visual system.
- `industrial_erp/public/js/industrial_login.js` implements the custom login view.
- `industrial_erp/public/js/industrial_portal.js` implements role routing, in-portal lists and forms, reports, notifications and live record counts.
- `industrial_erp/hooks.py` sends the website home route to the custom login and maps readable routes to the page templates.

The pages use Frappe's website renderer and plain HTML, CSS and JavaScript. The sidebar has three role-filtered expandable sections: CRM, Purchase and Sales. Sales roles see both Sales and CRM; Purchase-only roles see Purchase. Manufacturing and asset-care links are nested under Purchase, and people operations are nested under CRM. Administrators see every section and have one Frappe Desk link in the sidebar. A Reports dropdown sits immediately before Sign out in the top navigation.

## Authentication

The custom login form sends credentials to Frappe's existing `/api/method/login` endpoint. Frappe remains responsible for password validation, session cookies and authentication policy. The portal checks the active session and gets the user's name and role list from Frappe. The sign-out button calls Frappe's `logout` method through its request client so the request includes the current CSRF token, then returns to `/industrial-login`.

This is a custom user-facing experience over Frappe sessions, not a separate password or authentication system.

## Role access

Users with multiple operational roles see the combined workspaces. The frontend role mapping lives in `industrial_erp/public/js/industrial_portal.js`; adjust it if the target site uses different role names. The frontend only controls what it displays. Frappe DocType, report and API permission checks remain the security boundary.

| Sidebar section | Roles recognized | Main workflows surfaced |
| --- | --- | --- |
| CRM | Sales User/Manager, CRM User/Manager, HR and Payroll roles | Leads, Opportunities, follow-up activities, people operations and CRM activity reports |
| Purchase | Purchase User/Manager, Stock User, Manufacturing and Maintenance roles | Supplier sourcing, purchase orders/receipts/invoices, stock, production, assets and maintenance |
| Sales | Sales User/Manager, Accounts User/Manager, Administrator | Quotations, Sales Orders, delivery, invoices/returns, customer collections, account reports and admin options |

## In-portal pages and backend integration

The portal renders list, detail and create pages for Quotation, Sales Order, Sales Invoice, Lead, Opportunity, Purchase Order, Supplier Quotation, Purchase Receipt, Material Request, Delivery Note, Work Order, Asset, Employee, Attendance, Payroll Entry, Payment Entry, Asset Maintenance, Asset Maintenance Log, Job Card, Production Plan and Sales Person. It uses Frappe's permission-checked `/api/resource` endpoints to read and create draft documents. Draft submission uses `frappe.client.submit`; backend validations, workflows, totals and document lifecycle behavior remain unchanged.

The Notifications page reads the signed-in user's Notification Log records and supports marking a notification as read. Operational snapshot tiles use `frappe.client.get_count`; unavailable or denied counts display an em dash. Reports run through `frappe.desk.query_report.run` and render inside the custom portal.

The Reports dropdown shows seven requirement reports and filters the choices against the user's roles. It includes:

- Sales Order Delivery Tracking (ERPNext **Sales Order Analysis**)
- Salesperson Monthly Target (custom)
- Purchase Order Pending Receipts (custom)
- Supplier Quotation Comparison (ERPNext)
- Purchase Invoice Due Date Tracker (ERPNext **Accounts Payable**)
- Opportunity Stage Tracking (custom)
- Meeting & Call Activity Summary (custom)

Frappe checks report and record access. A link may still be denied if the user's site permissions do not grant access.

## Installation and use

Install the app in a Frappe bench and run the normal site migration/build process. Open the site root or `/industrial-login`; after login, users land on `/industrial-portal`. Non-admin users stay within the custom portal for their workflows. Administrators can open Desk using the single Desk option in their sidebar.

For local development, run the site with `bench start`, install/update the app on the target site, and use `bench build` after changing public assets. Users sign in with existing Frappe accounts.

## Development conventions

This app uses `pre-commit` for formatting and lint checks. Enable it from the app directory with `pre-commit install`. Configured tools include Ruff, ESLint, Prettier and pyupgrade.

## License

MIT
