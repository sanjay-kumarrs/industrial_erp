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
from frappe.utils import flt


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
            "label": _("Event ID"),
            "fieldname": "name",
            "fieldtype": "Link",
            "options": "Event",
            "width": 160
        },
        {
            "label": _("Subject"),
            "fieldname": "subject",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "label": _("Category"),
            "fieldname": "event_category",
            "fieldtype": "Data",
            "width": 120
        },
        {
            "label": _("Start Date & Time"),
            "fieldname": "starts_on",
            "fieldtype": "Datetime",
            "width": 160
        },
        {
            "label": _("End Date & Time"),
            "fieldname": "ends_on",
            "fieldtype": "Datetime",
            "width": 160
        },
        {
            "label": _("Status"),
            "fieldname": "status",
            "fieldtype": "Data",
            "width": 110
        },
        {
            "label": _("Sender"),
            "fieldname": "sender",
            "fieldtype": "Data",
            "width": 180
        },
        {
            "label": _("Reference Type"),
            "fieldname": "reference_doctype",
            "fieldtype": "Data",
            "width": 140
        },
        {
            "label": _("Reference Document"),
            "fieldname": "reference_docname",
            "fieldtype": "Dynamic Link",
            "options": "reference_doctype",
            "width": 160
        },
        {
            "label": _("Participants"),
            "fieldname": "participants",
            "fieldtype": "Data",
            "width": 220
        }
    ]


def get_data(filters):
    conditions = [
        "e.event_category IN ('Meeting', 'Call')"
    ]

    if filters.get("from_date"):
        conditions.append("DATE(e.starts_on) >= %(from_date)s")

    if filters.get("to_date"):
        conditions.append("DATE(e.starts_on) <= %(to_date)s")

    if filters.get("activity_category"):
        conditions.append(
            "e.event_category = %(activity_category)s"
        )

    if filters.get("status"):
        conditions.append("e.status = %(status)s")

    if filters.get("reference_doctype"):
        conditions.append(
            "e.reference_doctype = %(reference_doctype)s"
        )

    where_clause = " AND ".join(conditions)

    return frappe.db.sql(
        f"""
        SELECT
            e.name,
            e.subject,
            e.event_category,
            e.starts_on,
            e.ends_on,
            e.status,
            e.sender,
            e.reference_doctype,
            e.reference_docname,
            (
                SELECT GROUP_CONCAT(
                    DISTINCT ep.email
                    ORDER BY ep.idx
                    SEPARATOR ', '
                )
                FROM `tabEvent Participants` ep
                WHERE ep.parent = e.name
                  AND ep.parenttype = 'Event'
            ) AS participants

        FROM `tabEvent` e

        WHERE {where_clause}

        ORDER BY e.starts_on DESC, e.name
        """,
        filters,
        as_dict=True
    )


def get_summary(data):
    total_activities = len(data)

    meetings = sum(
        1 for row in data
        if row.event_category == "Meeting"
    )

    calls = sum(
        1 for row in data
        if row.event_category == "Call"
    )

    completed = sum(
        1 for row in data
        if row.status == "Completed"
    )

    return [
        {
            "label": _("Total Activities"),
            "value": total_activities,
            "indicator": "Blue"
        },
        {
            "label": _("Meetings"),
            "value": meetings,
            "indicator": "Green"
        },
        {
            "label": _("Calls"),
            "value": calls,
            "indicator": "Orange"
        },
        {
            "label": _("Completed Activities"),
            "value": completed,
            "indicator": "Green"
        }
    ]


def get_chart(data):
    meetings = sum(
        1 for row in data
        if row.event_category == "Meeting"
    )

    calls = sum(
        1 for row in data
        if row.event_category == "Call"
    )

    return {
        "data": {
            "labels": ["Meetings", "Calls"],
            "datasets": [
                {
                    "name": _("Activities"),
                    "values": [meetings, calls]
                }
            ]
        },
        "type": "bar",
        "height": 250
    }
