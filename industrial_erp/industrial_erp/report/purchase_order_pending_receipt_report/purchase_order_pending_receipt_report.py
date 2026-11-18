# Copyright (c) 2026, Sanjay and contributors
# For license information, please see license.txt

# import frappe


# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data


# def execute_snapshot_report(filters: dict | None = None):
# 	"""Return columns and data for the report.

# 	This is the main entry point for snapshot report. When 'Synced
# 	Report' is enabled in report, framework will call this method
# 	every time the report is refreshed or a filter is updated. It
# 	accepts the same filters as normal execute. But a utility method -
# 	get_latest_sync, is also imported.

# 	"""
# 	from frappe.database.duckdb.database import get_latest_sync

# 	columns, data = [], []
# 	return columns, data


import frappe
from frappe import _
from frappe.utils import flt, getdate, nowdate


def execute(filters=None):
    filters = frappe._dict(filters or {})

    validate_filters(filters)

    columns = get_columns()
    data = get_data(filters)

    return columns, data


def validate_filters(filters):
    if not filters.get("from_date") or not filters.get("to_date"):
        frappe.throw(_("From Date and To Date are mandatory."))

    if getdate(filters.from_date) > getdate(filters.to_date):
        frappe.throw(_("From Date cannot be after To Date."))


def get_columns():
    return [
        {
            "label": _("Purchase Order"),
            "fieldname": "purchase_order",
            "fieldtype": "Link",
            "options": "Purchase Order",
            "width": 160
        },
        {
            "label": _("Supplier"),
            "fieldname": "supplier",
            "fieldtype": "Link",
            "options": "Supplier",
            "width": 160
        },
        {
            "label": _("PO Date"),
            "fieldname": "transaction_date",
            "fieldtype": "Date",
            "width": 100
        },
        {
            "label": _("Item Code"),
            "fieldname": "item_code",
            "fieldtype": "Link",
            "options": "Item",
            "width": 130
        },
        {
            "label": _("Item Name"),
            "fieldname": "item_name",
            "fieldtype": "Data",
            "width": 160
        },
        {
            "label": _("Ordered Qty"),
            "fieldname": "ordered_qty",
            "fieldtype": "Float",
            "width": 100
        },
        {
            "label": _("Received Qty"),
            "fieldname": "received_qty",
            "fieldtype": "Float",
            "width": 100
        },
        {
            "label": _("Pending Qty"),
            "fieldname": "pending_qty",
            "fieldtype": "Float",
            "width": 100
        },
        {
            "label": _("Expected Delivery Date"),
            "fieldname": "schedule_date",
            "fieldtype": "Date",
            "width": 140
        },
        {
            "label": _("Days Overdue"),
            "fieldname": "days_overdue",
            "fieldtype": "Int",
            "width": 100
        },
        {
            "label": _("Status"),
            "fieldname": "receipt_status",
            "fieldtype": "Data",
            "width": 130
        }
    ]


def get_data(filters):
    conditions = [
        "po.docstatus = 1",
        "po.status NOT IN ('Closed', 'Cancelled')",
        "poi.qty > poi.received_qty",
        "po.transaction_date BETWEEN %(from_date)s AND %(to_date)s"
    ]

    values = {
        "from_date": filters.from_date,
        "to_date": filters.to_date,
        "today": nowdate()
    }

    if filters.get("supplier"):
        conditions.append("po.supplier = %(supplier)s")
        values["supplier"] = filters.supplier

    if filters.get("purchase_order"):
        conditions.append("po.name = %(purchase_order)s")
        values["purchase_order"] = filters.purchase_order

    status = filters.get("receipt_status") or "All"

    if status == "Overdue":
        conditions.append("poi.schedule_date < %(today)s")
    elif status == "Partially Received":
        conditions.append("poi.received_qty > 0")
    elif status == "Pending":
        conditions.append("poi.received_qty = 0")

    where_clause = " AND ".join(conditions)

    return frappe.db.sql(
        f"""
        SELECT
            po.name AS purchase_order,
            po.supplier,
            po.transaction_date,
            poi.item_code,
            poi.item_name,
            poi.qty AS ordered_qty,
            poi.received_qty,
            (poi.qty - poi.received_qty) AS pending_qty,
            poi.schedule_date,

            CASE
                WHEN poi.schedule_date < %(today)s
                THEN DATEDIFF(%(today)s, poi.schedule_date)
                ELSE 0
            END AS days_overdue,

            CASE
                WHEN poi.schedule_date < %(today)s
                    THEN 'Overdue'
                WHEN poi.received_qty > 0
                    THEN 'Partially Received'
                ELSE 'Pending'
            END AS receipt_status

        FROM `tabPurchase Order` po

        INNER JOIN `tabPurchase Order Item` poi
            ON poi.parent = po.name

        WHERE {where_clause}

        ORDER BY poi.schedule_date ASC, po.name ASC
        """,
        values,
        as_dict=True
    )
