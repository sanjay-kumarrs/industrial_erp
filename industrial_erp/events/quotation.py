
import frappe
from frappe import _
from frappe.utils import flt


def set_quotation_approval_requirement(doc, method=None):
    """Set the approval requirement using the company's configured limit."""

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
    quotation_total = flt(doc.grand_total)

    doc.custom_requires_approval = int(quotation_total > approval_limit)


def validate_quotation_submission(doc, method=None):
    """Allow submission only through the Approved workflow transition."""

    # The final workflow transition must set the state to Submitted.
    if doc.custom_workflow_state != "Submitted":
        frappe.throw(
            _("Use the workflow action to submit the quotation. "
              "The quotation must reach the Submitted state.")
        )

    # During the workflow submission, the database should still contain
    # the previous state: Approved.
    previous_state = frappe.db.get_value(
        "Quotation",
        doc.name,
        "custom_workflow_state"
    )

    if previous_state != "Approved":
        frappe.throw(
            _("Quotation must pass through the Approved state before submission.")
        )

    settings = frappe.get_single("Sales Approval Settings")

    if not settings.enable_approval:
        return

    if settings.company != doc.company:
        frappe.throw(
            _("Sales Approval Settings are not configured for company {0}.").format(
                doc.company
            )
        )

    approval_required = flt(doc.grand_total) > flt(settings.approval_limit)

    roles = frappe.get_roles()

    if approval_required and not (
    "Sales Manager" in roles
    or "System Manager" in roles
    ):
        frappe.throw(
            _("Only a Sales Manager or System Manager can submit "
              "a quotation requiring approval.")
        )
