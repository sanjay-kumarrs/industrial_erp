# # Copyright (c) 2026, Sanjay and contributors
# # For license information, please see license.txt

# # import frappe


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
from frappe.utils import getdate, flt


def execute(filters=None):
    filters = frappe._dict(filters or {})

    columns = get_columns()
    data = get_data(filters)
    report_summary = get_summary(data)

    chart = get_chart(data)

    return columns, data, None, chart, report_summary


def get_columns():
    return [
        {
            "label": _("Opportunity ID"),
            "fieldname": "name",
            "fieldtype": "Link",
            "options": "Opportunity",
            "width": 170,
        },
        {
            "label": _("Opportunity From"),
            "fieldname": "opportunity_from",
            "fieldtype": "Data",
            "width": 120,
        },
        {
            "label": _("Party Name"),
            "fieldname": "party_name",
            "fieldtype": "Dynamic Link",
            "options": "opportunity_from",
            "width": 170,
        },
        {
            "label": _("Opportunity Type"),
            "fieldname": "opportunity_type",
            "fieldtype": "Data",
            "width": 130,
        },
        {
            "label": _("Sales Stage"),
            "fieldname": "sales_stage",
            "fieldtype": "Data",
            "width": 140,
        },
        {
            "label": _("Status"),
            "fieldname": "status",
            "fieldtype": "Data",
            "width": 110,
        },
        {
            "label": _("Opportunity Owner"),
            "fieldname": "owner",
            "fieldtype": "Link",
            "options": "User",
            "width": 170,
        },
        {
            "label": _("Expected Closing"),
            "fieldname": "expected_closing",
            "fieldtype": "Date",
            "width": 120,
        },
        {
            "label": _("Probability (%)"),
            "fieldname": "probability",
            "fieldtype": "Percent",
            "width": 110,
        },
        {
            "label": _("Expected Amount"),
            "fieldname": "expected_amount",
            "fieldtype": "Currency",
            "width": 140,
        },
    ]


def get_data(filters):
    conditions = ["docstatus < 2"]

    if filters.get("from_date"):
        conditions.append("creation >= %(from_date)s")

    if filters.get("to_date"):
        conditions.append("creation < DATE_ADD(%(to_date)s, INTERVAL 1 DAY)")

    if filters.get("sales_stage"):
        conditions.append("sales_stage = %(sales_stage)s")

    if filters.get("status"):
        conditions.append("status = %(status)s")

    if filters.get("opportunity_owner"):
        conditions.append("owner = %(opportunity_owner)s")

    if filters.get("opportunity_type"):
        conditions.append("opportunity_type = %(opportunity_type)s")

    where_clause = " AND ".join(conditions)

    return frappe.db.sql(
        f"""
        SELECT
            name,
            opportunity_from,
            party_name,
            opportunity_type,
            sales_stage,
            status,
            owner,
            expected_closing,
            probability,
            opportunity_amount AS expected_amount
        FROM `tabOpportunity`
        WHERE {where_clause}
        ORDER BY sales_stage, expected_closing, name
        """,
        filters,
        as_dict=True,
    )


def get_summary(data):
    total_opportunities = len(data)
    total_amount = sum(flt(row.expected_amount) for row in data)

    stage_counts = {}
    for row in data:
        stage = row.sales_stage or "Unassigned"
        stage_counts[stage] = stage_counts.get(stage, 0) + 1

    return [
        {
            "label": _("Total Opportunities"),
            "value": total_opportunities,
            "indicator": "Blue",
        },
        {
            "label": _("Expected Pipeline Value"),
            "value": total_amount,
            "indicator": "Green",
            "datatype": "Currency",
        },
        {
            "label": _("Sales Stages"),
            "value": len(stage_counts),
            "indicator": "Orange",
        },
    ]


def get_chart(data):
    stage_totals = {}

    for row in data:
        stage = row.sales_stage or "Unassigned"
        stage_totals[stage] = stage_totals.get(stage, 0) + 1

    return {
        "data": {
            "labels": list(stage_totals.keys()),
            "datasets": [
                {
                    "name": _("Opportunities"),
                    "values": list(stage_totals.values()),
                }
            ],
        },
        "type": "bar",
        "height": 250,
    }
