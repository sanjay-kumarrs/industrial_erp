# Industrial ERP

An industrial operations app for Frappe and ERPNext, with a responsive web workspace for Sales, Purchase, CRM, Manufacturing, Service, HR, Management and System Administrators.

## Frontend architecture

The custom web frontend lives in the Frappe app and is served as standard website pages:

- `industrial_login.html` provides the branded sign-in page at `/industrial-login`.
- `industrial_portal.html` provides the authenticated workspace at `/industrial-portal`.
- `public/css/industrial_portal.css` contains the responsive industrial visual system.
- `public/js/industrial_login.js` and `public/js/industrial_portal.js` implement session flow, role-aware navigation, workflow links and live record counts.
- `hooks.py` sends the website home route to the custom login and maps readable route aliases to the page templates.

The page is built with the existing Frappe website renderer and plain HTML, CSS and JavaScript. It does not add a separate frontend build pipeline or alter ERPNext document logic.

## Authentication flow

1. Visitors reach `/` or `/industrial-login` and see the custom login form.
2. The form posts credentials to Frappe's existing `/api/method/login` endpoint. Frappe owns password validation, session cookies and authentication policy.
3. After sign-in, the browser opens `/industrial-portal`. The page checks the active session with `frappe.auth.get_logged_user`, reads the user's name and role list from the current Frappe boot data or the user's own `User` record, and routes the interface to the appropriate role workspace.
4. Sign out calls Frappe's existing `/api/method/logout` endpoint and returns to `/industrial-login`.

This is a custom user-facing login and logout experience over Frappe's supported session APIs. It does not implement separate password storage or an independent authentication system.

## Role access

Navigation and dashboard cards are selected from the role list returned by Frappe. Users with multiple operational roles see the combined workspaces. The System Manager/Administrator workspace includes a direct **Frappe Desk** link. The frontend only controls what it displays: Frappe's DocType, report and API permission checks remain the security boundary.

| Workspace | Roles recognized | Main workflows surfaced |
| --- | --- | --- |
| Sales & CRM | Sales User, Sales Manager, Sales Master Manager | Quotations, Sales Orders, Delivery Notes, returns, Customers, Leads, Opportunities, sales invoices and CRM activity |
| Purchase | Purchase User, Purchase Manager, Stock User | Material Requests, Supplier Quotations, Purchase Orders, Purchase Receipts, Suppliers, Purchase Invoices and receipt reports |
| Manufacturing | Manufacturing User, Manufacturing Manager, Manufacturing | Work Orders, Production Plans, Job Cards, BOMs, Items and Stock Entries |
| Service | Maintenance User, Maintenance Manager, Asset Manager | Assets, Asset Maintenance schedules and maintenance logs |
| People | HR User, HR Manager, Payroll User, Payroll Manager, Employee Self Service | Employees, Attendance, Payroll Entries, Salary Slips and payroll reports |
| Management | Accounts User, Accounts Manager | Cross-functional order, production and asset views plus configured operational reports |
| Administrator | System Manager, Administrator | Cross-functional workflows, report links, User/Role administration and Frappe Desk |

Role names are matched in the frontend for presentation. Adjust the role mapping in `public/js/industrial_portal.js` if this site's role naming differs. Frappe still rejects any record, report or operation the user is not permitted to access.

## Reports and backend integration

The portal opens ERPNext list, form and query-report routes so each workflow continues to use the existing backend. Operational snapshot tiles use `frappe.client.get_count` for Sales Orders, Opportunities, Leads, Purchase Orders, Purchase Receipts, Suppliers, Work Orders, Production Plans, Items, Assets, Maintenance records, Employees, Attendance and Payroll Entries. A tile displays an em dash when its count API request is unavailable or denied.

Custom report links included in the portal:

- Opportunity Stage Tracking Report
- Purchase Order Pending Receipts Report
- Purchase Order Pending Receipt Report
- Salesperson Monthly Target Report
- Meeting Call Activity Summary

The Sales and Purchase workspaces also link to standard ERPNext doctypes and commonly available reports. Those standard report routes depend on the installed ERPNext version and enabled modules. The custom report links above match this app's report definitions. Report execution and data access are checked by Frappe.

## Backend scope

Existing Frappe DocTypes, workflows, validations, reports and document events remain the source of truth. The frontend adds no alternate business rules. To add another existing workflow or report to the portal, update its role's card and link definition in `industrial_erp/public/js/industrial_portal.js`.

## Installation and use

Install the app in a Frappe bench and run the normal site migration/build process. After the app is installed, open the site root or `/industrial-login`; authenticated users land on `/industrial-portal` after signing in. Administrators can reach Desk from the portal sidebar or dashboard shortcut.

For local development, run the site with `bench start`, install/update the app on the target site, and use `bench build` when changing public assets. Log in with an existing Frappe user; the frontend does not create or manage user accounts.

## Development conventions

This app uses `pre-commit` for formatting and lint checks. Install and enable it from the app directory:

```bash
pre-commit install
```

The configured tools include Ruff, ESLint, Prettier and pyupgrade.

## License

MIT
