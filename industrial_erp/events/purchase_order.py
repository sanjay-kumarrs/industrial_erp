import frappe
from frappe import _
from frappe.utils import flt


def set_purchase_order_approval_requirement(doc, method=None):
    """Determine whether a Purchase Order requires approval."""

    settings = frappe.get_single("Sales Approval Settings")

    if not settings.enable_approval:
        doc.custom_requires_approval = 0
        return

    if settings.company != doc.company:
        frappe.throw(
            _("Sales Approval Settings are not configured for company {0}.").format(
                doc.company
            )
        )

    approval_limit = flt(settings.approval_limit)

    doc.custom_requires_approval = int(
        flt(doc.grand_total) > approval_limit
    )


def validate_purchase_order_submission(doc, method=None):
    """Block submission of Purchase Orders requiring approval."""

    if not doc.custom_requires_approval:
        return

    if doc.custom_workflow_state != "Approved":
        frappe.throw(
            _("Purchase Order exceeds the approval limit of {0}. "
              "Approval is required before submission.").format(
                frappe.format_value(100000, {"fieldtype": "Currency"})
            )
        )