
import frappe
from frappe import _
from frappe.utils import getdate, flt


MONTHS = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
}


def execute(filters=None):
    filters = frappe._dict(filters or {})

    if not filters.get("year"):
        frappe.throw(_("Please select a Year."))

    selected_year = getdate(filters.year).year
    selected_month = MONTHS.get(filters.get("month"))
    selected_sales_person = filters.get("sales_person")
    selected_status = filters.get("status")

    columns = get_columns()

    conditions = [
        "YEAR(target_month) = %(year)s"
    ]

    query_filters = {
        "year": selected_year
    }

    if selected_month:
        conditions.append("MONTH(target_month) = %(month)s")
        query_filters["month"] = selected_month

    if selected_sales_person:
        conditions.append("sales_person = %(sales_person)s")
        query_filters["sales_person"] = selected_sales_person

    target_records = frappe.db.sql(
        f"""
        SELECT
            sales_person,
            target_month,
            SUM(target_amount) AS target_amount
        FROM
            `tabSales Person Monthly Target`
        WHERE
            {" AND ".join(conditions)}
        GROUP BY
            sales_person, target_month
        ORDER BY
            target_month, sales_person
        """,
        query_filters,
        as_dict=True
    )

    if not target_records:
        return columns, [], _("No monthly targets found for the selected filters.")

    actual_conditions = [
        "si.docstatus = 1",
        "YEAR(si.posting_date) = %(year)s"
    ]

    actual_filters = {
        "year": selected_year
    }

    if selected_month:
        actual_conditions.append("MONTH(si.posting_date) = %(month)s")
        actual_filters["month"] = selected_month

    if selected_sales_person:
        actual_conditions.append("st.sales_person = %(sales_person)s")
        actual_filters["sales_person"] = selected_sales_person

    actual_records = frappe.db.sql(
        f"""
        SELECT
            st.sales_person,
            YEAR(si.posting_date) AS sales_year,
            MONTH(si.posting_date) AS sales_month,
            SUM(
                CASE
                    WHEN si.is_return = 1
                    THEN -ABS(st.allocated_amount)
                    ELSE ABS(st.allocated_amount)
                END
            ) AS actual_sales
        FROM
            `tabSales Invoice` si
        INNER JOIN
            `tabSales Team` st
            ON st.parent = si.name
        WHERE
            {" AND ".join(actual_conditions)}
        GROUP BY
            st.sales_person,
            YEAR(si.posting_date),
            MONTH(si.posting_date)
        """,
        actual_filters,
        as_dict=True
    )

    actual_map = {}

    for record in actual_records:
        key = (
            record.sales_person,
            record.sales_year,
            record.sales_month
        )
        actual_map[key] = flt(record.actual_sales)

    data = []

    for target in target_records:
        target_date = getdate(target.target_month)

        key = (
            target.sales_person,
            target_date.year,
            target_date.month
        )

        target_amount = flt(target.target_amount)
        actual_amount = flt(actual_map.get(key, 0))

        achievement = (
            (actual_amount / target_amount) * 100
            if target_amount > 0
            else 0
        )

        remaining = max(target_amount - actual_amount, 0)

        status = (
            "Achieved"
            if target_amount > 0 and actual_amount >= target_amount
            else "Not Achieved"
        )

        if selected_status and status != selected_status:
            continue

        data.append({
            "sales_person": target.sales_person,
            "month": target_date.strftime("%B"),
            "year": target_date.year,
            "target_amount": target_amount,
            "actual_sales": actual_amount,
            "achievement": achievement,
            "remaining_target": remaining,
            "status": status
        })

    if not data:
        return columns, [], _("No records found for the selected filters.")

    total_target = sum(row["target_amount"] for row in data)
    total_actual = sum(row["actual_sales"] for row in data)
    total_remaining = sum(row["remaining_target"] for row in data)

    achieved_count = sum(
        1 for row in data if row["status"] == "Achieved"
    )

    not_achieved_count = len(data) - achieved_count

    overall_achievement = (
        (total_actual / total_target) * 100
        if total_target > 0
        else 0
    )

    report_summary = [
        {
            "label": _("Total Target"),
            "value": total_target,
            "indicator": "Blue",
            "datatype": "Currency"
        },
        {
            "label": _("Actual Sales"),
            "value": total_actual,
            "indicator": "Green",
            "datatype": "Currency"
        },
        {
            "label": _("Achievement"),
            "value": overall_achievement,
            "indicator": "Green" if overall_achievement >= 100 else "Orange",
            "datatype": "Percent"
        },
        {
            "label": _("Achieved"),
            "value": achieved_count,
            "indicator": "Green",
            "datatype": "Int"
        },
        {
            "label": _("Not Achieved"),
            "value": not_achieved_count,
            "indicator": "Orange",
            "datatype": "Int"
        }
    ]

    chart = {
        "data": {
            "labels": [
                f'{row["sales_person"]} - {row["month"]}'
                for row in data
            ],
            "datasets": [
                {
                    "name": "Target",
                    "values": [row["target_amount"] for row in data]
                },
                {
                    "name": "Actual Sales",
                    "values": [row["actual_sales"] for row in data]
                }
            ]
        },
        "type": "bar",
        "height": 250,
        "colors": ["#7cd6fd", "#5e64ff"]
    }

    return columns, data, None, chart, report_summary


def get_columns():
    return [
        {
            "fieldname": "sales_person",
            "label": _("Sales Person"),
            "fieldtype": "Link",
            "options": "Sales Person",
            "width": 180
        },
        {
            "fieldname": "month",
            "label": _("Month"),
            "fieldtype": "Data",
            "width": 110
        },
        {
            "fieldname": "year",
            "label": _("Year"),
            "fieldtype": "Int",
            "width": 80
        },
        {
            "fieldname": "target_amount",
            "label": _("Target Amount"),
            "fieldtype": "Currency",
            "width": 140
        },
        {
            "fieldname": "actual_sales",
            "label": _("Actual Sales"),
            "fieldtype": "Currency",
            "width": 140
        },
        {
            "fieldname": "achievement",
            "label": _("Achievement %"),
            "fieldtype": "Percent",
            "width": 120
        },
        {
            "fieldname": "remaining_target",
            "label": _("Remaining Target"),
            "fieldtype": "Currency",
            "width": 140
        },
        {
            "fieldname": "status",
            "label": _("Status"),
            "fieldtype": "Data",
            "width": 120
        }
    ]
