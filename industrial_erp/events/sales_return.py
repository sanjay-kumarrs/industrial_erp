
import frappe
from frappe import _
from frappe.utils import flt


def validate_sales_return(doc, method=None):
    """Validate Sales Invoice returns against the original submitted invoice."""

    if not doc.is_return:
        return

    # 1. Original invoice reference is mandatory
    if not doc.return_against:
        frappe.throw(_("Please select the original Sales Invoice in Return Against."))

    original = frappe.get_doc("Sales Invoice", doc.return_against)

    # 2. Original invoice must be submitted and cannot itself be a return
    if original.docstatus != 1 or original.is_return:
        frappe.throw(_("The original Sales Invoice must be submitted and cannot be a return."))

    # 3. Customer must match
    if doc.customer != original.customer:
        frappe.throw(_("Customer must match the original Sales Invoice."))

    original_items = {}
    for item in original.items:
        original_items.setdefault(item.item_code, 0)
        original_items[item.item_code] += flt(item.qty)

    # 4. Validate returned items and quantities
    requested_by_item = {}

    for item in doc.items:
        if item.item_code not in original_items:
            frappe.throw(
                _("Item {0} does not exist in the original Sales Invoice.").format(
                    item.item_code
                )
            )

        return_qty = abs(flt(item.qty))
        if return_qty <= 0:
            frappe.throw(_("Return quantity must be greater than zero."))

        requested_by_item[item.item_code] = (
            requested_by_item.get(item.item_code, 0) + return_qty
        )

    # 5. Calculate quantities already returned by other submitted returns
    previous_returns = frappe.get_all(
        "Sales Invoice",
        filters={
            "return_against": original.name,
            "is_return": 1,
            "docstatus": 1,
            "name": ["!=", doc.name or ""],
        },
        fields=["name"],
    )

    already_returned = {}

    for return_invoice in previous_returns:
        returned_doc = frappe.get_doc("Sales Invoice", return_invoice.name)

        for item in returned_doc.items:
            already_returned[item.item_code] = (
                already_returned.get(item.item_code, 0) + abs(flt(item.qty))
            )

    # 6. Prevent cumulative returns from exceeding original quantity
    for item_code, requested_qty in requested_by_item.items():
        eligible_qty = (
            original_items[item_code] - already_returned.get(item_code, 0)
        )

        if requested_qty > eligible_qty:
            frappe.throw(
                _(
                    "Cannot return {0} of item {1}. Only {2} is eligible for return."
                ).format(requested_qty, item_code, max(eligible_qty, 0))
            )
