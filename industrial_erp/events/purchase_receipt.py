import frappe
from frappe import _
from frappe.utils import flt


def validate_purchase_receipt_over_receipt(doc, method=None):
    """Prevent cumulative received quantity from exceeding PO item quantity."""

    receipt_totals = {}

    for item in doc.items:
        if not item.purchase_order or not item.purchase_order_item:
            continue

        po_item_id = item.purchase_order_item

        receipt_totals[po_item_id] = (
            receipt_totals.get(po_item_id, 0) + flt(item.received_qty)
        )

    for po_item_id, current_received_qty in receipt_totals.items():

        po_item = frappe.db.get_value(
            "Purchase Order Item",
            po_item_id,
            ["qty", "item_code", "parent"],
            as_dict=True
        )

        if not po_item:
            frappe.throw(
                _("Purchase Order Item {0} was not found.").format(po_item_id)
            )

        previous_received_qty = frappe.db.sql(
            """
            SELECT COALESCE(SUM(pri.received_qty), 0)
            FROM `tabPurchase Receipt Item` pri
            INNER JOIN `tabPurchase Receipt` pr
                ON pr.name = pri.parent
            WHERE pr.docstatus = 1
              AND pri.purchase_order_item = %s
              AND pr.name != %s
            """,
            (po_item_id, doc.name)
        )[0][0]

        total_received_qty = (
            flt(previous_received_qty) + current_received_qty
        )

        ordered_qty = flt(po_item.qty)

        if total_received_qty > ordered_qty:
            frappe.throw(
                _("Over-receipt not allowed for item {0}. "
                  "Ordered: {1}, Previously received: {2}, "
                  "Current receipt: {3}, Total: {4}.").format(
                    po_item.item_code,
                    ordered_qty,
                    flt(previous_received_qty),
                    current_received_qty,
                    total_received_qty
                )
            )